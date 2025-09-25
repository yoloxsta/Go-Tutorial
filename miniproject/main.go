package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
)

// Task struct
type Task struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Completed bool   `json:"completed"`
}

// Data များကို memory တွင် သိမ်းဆည်းရန်
var (
	tasks  = make(map[int]Task) // Use a map for easier lookup/delete later
	nextID = 1
	mu     sync.Mutex // Mutex for thread-safe access to tasks and nextID
)

// tasksHandler သည် "/tasks" path သို့ ရောက်လာသော requests များကို ကိုင်တွယ်မည်
func tasksHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getTasks(w, r)
	case http.MethodPost:
		createTask(w, r)
	default:
		// အခြား HTTP methods များကို ခွင့်မပြုပါ
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// GET /tasks - Task အားလုံးကို ပြန်ပေးသည်
func getTasks(w http.ResponseWriter, r *http.Request) {
	// Map မှ value များကို slice အဖြစ် ပြောင်းလဲခြင်း
	var taskList []Task
	for _, task := range tasks {
		taskList = append(taskList, task)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(taskList)
}

// POST /tasks - Task အသစ်တစ်ခု ဖန်တီးသည်
func createTask(w http.ResponseWriter, r *http.Request) {
	var newTask Task

	// Request body မှ JSON ကို decode လုပ်ခြင်း
	if err := json.NewDecoder(r.Body).Decode(&newTask); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// ID အသစ်တစ်ခု သတ်မှတ်ပြီး tasks map ထဲသို့ ထည့်သွင်းခြင်း
	newTask.ID = nextID
	tasks[newTask.ID] = newTask
	nextID++

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated) // 201 Created status code
	json.NewEncoder(w).Encode(newTask)
}
func main() {
	// "/tasks" path ကို tasksHandler နှင့် ချိတ်ဆက်သည်
	http.HandleFunc("/tasks", tasksHandler)

	fmt.Println("Starting REST API server on http://localhost:8080")
	// Port 8080 တွင် server ကို စတင် run သည်
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Could not start server: %s\n", err.Error())
	}
}
