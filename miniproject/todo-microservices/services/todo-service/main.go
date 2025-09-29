package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

type Todo struct {
	ID    int    `json:"id"`
	Title string `json:"title"`
	Done  bool   `json:"done"`
}

var todos = []Todo{
	{ID: 1, Title: "Learn Go", Done: false},
	{ID: 2, Title: "Build React UI", Done: true},
}

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func sendNotification(message string) {
	client := &http.Client{}
	note := map[string]string{"message": message}
	jsonData, _ := json.Marshal(note)

	req, err := http.NewRequest("POST", "http://localhost:8083/notify", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Println("Failed to create notification request:", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Println("Failed to send notification:", err)
		return
	}
	defer resp.Body.Close()
	log.Println("Notification service responded:", resp.Status)
}

func todoHandler(w http.ResponseWriter, r *http.Request) {
	// Handle /todos (GET, POST)
	if r.URL.Path == "/todos" {
		switch r.Method {
		case http.MethodGet:
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(todos)
		case http.MethodPost:
			var newTodo Todo
			json.NewDecoder(r.Body).Decode(&newTodo)
			newTodo.ID = len(todos) + 1
			todos = append(todos, newTodo)
			go sendNotification("New todo added: " + newTodo.Title)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(newTodo)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
		return
	}

	// Handle /todos/{id} (PUT, DELETE)
	if len(r.URL.Path) > 7 && r.URL.Path[:7] == "/todos/" {
		idStr := r.URL.Path[7:]
		id, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "Invalid ID", http.StatusBadRequest)
			return
		}

		// Find todo index
		var idx int = -1
		for i, t := range todos {
			if t.ID == id {
				idx = i
				break
			}
		}
		if idx == -1 {
			http.Error(w, "Todo not found", http.StatusNotFound)
			return
		}

		switch r.Method {
		case http.MethodPut:
			var updated Todo
			json.NewDecoder(r.Body).Decode(&updated)
			updated.ID = id // preserve ID
			todos[idx] = updated
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(updated)
		case http.MethodDelete:
			todos = append(todos[:idx], todos[idx+1:]...)
			w.WriteHeader(http.StatusNoContent)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
		return
	}

	http.Error(w, "Not found", http.StatusNotFound)
}

func main() {
	http.HandleFunc("/todos", enableCORS(todoHandler))
	http.HandleFunc("/todos/", enableCORS(todoHandler)) // catches /todos/1, etc.
	log.Println("Todo service running on :8082")
	log.Fatal(http.ListenAndServe(":8082", nil))
}
