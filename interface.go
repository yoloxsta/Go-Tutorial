package main

import "fmt"

// Define an interface
type Animal interface {
	Speak() string
}

// Dog struct
type Dog struct{}

func (d Dog) Speak() string {
	return "Woof!"
}

// Cat struct
type Cat struct{}

func (c Cat) Speak() string {
	return "Meow!"
}

// Function that works with any Animal
func makeSound(a Animal) {
	fmt.Println(a.Speak())
}

func main() {
	d := Dog{}
	c := Cat{}

	makeSound(d) // Dog says Woof!
	makeSound(c) // Cat says Meow!
}
