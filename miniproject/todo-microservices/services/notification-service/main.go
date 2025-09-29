// services/notification-service/main.go
package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var (
	clients    = make(map[*websocket.Conn]bool)
	broadcast  = make(chan string)
	register   = make(chan *websocket.Conn)
	unregister = make(chan *websocket.Conn)
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins (for dev only!)
	},
}

// WebSocket handler
func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	register <- conn
	defer func() { unregister <- conn }()

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}
	}
}

// HTTP endpoint to trigger notification (called by todo-service)
func notifyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var msg struct {
		Message string `json:"message"`
	}
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&msg); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Broadcast to all connected WebSocket clients
	broadcast <- msg.Message

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"broadcasted"}`))
}

// Goroutine to manage WebSocket connections
func manageConnections() {
	for {
		select {
		case conn := <-register:
			clients[conn] = true
			log.Printf("Client connected. Total: %d", len(clients))
		case conn := <-unregister:
			if _, ok := clients[conn]; ok {
				delete(clients, conn)
				log.Printf("Client disconnected. Total: %d", len(clients))
			}
		case message := <-broadcast:
			log.Println("Broadcasting:", message)
			for conn := range clients {
				if err := conn.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
					log.Println("Write error:", err)
					unregister <- conn
				}
			}
		}
	}
}

func main() {
	// Start WebSocket manager
	go manageConnections()

	// Routes
	http.HandleFunc("/ws", wsHandler)         // WebSocket endpoint
	http.HandleFunc("/notify", notifyHandler) // HTTP trigger

	log.Println("Notification service running on :8083")
	log.Fatal(http.ListenAndServe(":8083", nil))
}
