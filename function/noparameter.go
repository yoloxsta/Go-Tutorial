package main

import "fmt"

// Parameter မရှိ၊ return value မရှိသော function
func sayHello() {
	fmt.Println("Hello from a function!")
}

func main() {
	// function ကို ခေါ်ယူအသုံးပြုခြင်း
	sayHello()
}
