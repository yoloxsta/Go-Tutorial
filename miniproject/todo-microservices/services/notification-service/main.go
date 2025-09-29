// services/notification-service/main.go
package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type Notification struct {
	Message string `json:"message"`
}

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func sendNotificationHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	var note Notification
	json.NewDecoder(r.Body).Decode(&note)

	// In real life: send email, push, etc.
	log.Printf("📧 Notification sent: %s", note.Message)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "sent"})
}

func main() {
	http.HandleFunc("/notify", enableCORS(sendNotificationHandler))
	log.Println("Notification service running on :8083")
	log.Fatal(http.ListenAndServe(":8083", nil))
}
