package main

import "fmt"

// `a` နှင့် `b` (int type) ကို parameter အဖြစ် လက်ခံပြီး
// `int` type တန်ဖိုးတစ်ခုကို return ပြန်ပေးသော function
func add(a int, b int) int {
	return a + b
}

// Parameter type တွေ တူညီပါက အတို gọn ရေးနိုင်သည်
func subtract(a, b int) int {
	return a - b
}

// Function to multiply two integers
func multiply(a, b int) int {
	return a * b
}
func div(a, b int) int {
	return a / b
}

func main() {
	sum := add(10, 5)
	fmt.Println("Sum:", sum)

	difference := subtract(10, 5)
	fmt.Println("Difference:", difference)

	product := multiply(10, 5)
	fmt.Println("Product:", product)

	divi := div(10, 5)
	fmt.Println("Divi ans:", divi)
}
