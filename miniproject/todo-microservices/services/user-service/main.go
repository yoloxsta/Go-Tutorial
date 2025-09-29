package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
}

var users = []User{
	{ID: "1", Username: "admin", Password: "password"},
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

func loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var creds struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	json.NewDecoder(r.Body).Decode(&creds)

	for _, u := range users {
		if u.Username == creds.Username && u.Password == creds.Password {
			token := map[string]string{
				"token": "mock-jwt-token-for-" + u.ID,
				"user":  u.Username,
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(token)
			return
		}
	}
	http.Error(w, "Invalid credentials", http.StatusUnauthorized)
}

func main() {
	http.HandleFunc("/login", enableCORS(loginHandler))
	log.Println("User service running on :8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}
