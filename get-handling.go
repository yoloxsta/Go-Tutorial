package main

import (
	"fmt"
	"net/http"
)

func greetHandler(w http.ResponseWriter, r *http.Request) {
	name := r.URL.Query().Get("name") // ?name=Bob
	if name == "" {
		name = "Guest"
	}
	fmt.Fprintf(w, "Hello, %s!", name)
}

func main() {
	http.HandleFunc("/greet", greetHandler)

	fmt.Println("Server running at http://localhost:8080/")
	http.ListenAndServe(":8080", nil)
}
