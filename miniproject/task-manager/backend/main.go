package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Task model
type Task struct {
	ID   int    `json:"id"`
	Text string `json:"text"`
	Done bool   `json:"done"`
}

var tasks = []Task{
	{ID: 1, Text: "Learn Go", Done: false},
	{ID: 2, Text: "Build React frontend", Done: false},
}
var nextID = 3

func main() {
	r := gin.Default()

	// CORS middleware (for React dev server)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Routes
	r.GET("/tasks", getTasks)
	r.POST("/tasks", createTask)
	r.PUT("/tasks/:id", updateTask)
	r.DELETE("/tasks/:id", deleteTask)

	r.Run(":8080") // http://localhost:8080
}

func getTasks(c *gin.Context) {
	c.JSON(http.StatusOK, tasks)
}

func createTask(c *gin.Context) {
	var newTask Task
	if err := c.ShouldBindJSON(&newTask); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	newTask.ID = nextID
	nextID++
	tasks = append(tasks, newTask)
	c.JSON(http.StatusCreated, newTask)
}

func updateTask(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	for i, t := range tasks {
		if t.ID == id {
			var updated Task
			if err := c.ShouldBindJSON(&updated); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			tasks[i].Text = updated.Text
			tasks[i].Done = updated.Done
			c.JSON(http.StatusOK, tasks[i])
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
}

func deleteTask(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	for i, t := range tasks {
		if t.ID == id {
			tasks = append(tasks[:i], tasks[i+1:]...)
			c.Status(http.StatusNoContent)
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
}
