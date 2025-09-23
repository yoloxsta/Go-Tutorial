package main

import "fmt"

func main() {
	// 1. Array: Fixed subjects (array size is fixed at compile time)
	subjects := [3]string{"Math", "Science", "English"}
	fmt.Println("Subjects offered:", subjects)

	// 2. Slice: Dynamic list of students
	students := []string{}
	students = append(students, "Alice", "Bob", "Charlie", "sta")
	fmt.Println("\nStudent List:", students)

	// 3. Map: Store student scores
	scores := make(map[string]map[string]int) // student -> subject -> score

	// Add marks for students
	scores["Alice"] = map[string]int{
		"Math":    85,
		"Science": 90,
		"English": 78,
	}
	scores["Bob"] = map[string]int{
		"Math":    70,
		"Science": 88,
		"English": 95,
	}
	scores["Charlie"] = map[string]int{
		"Math":    92,
		"Science": 81,
		"English": 89,
	}
	scores["sta"] = map[string]int{
		"Math":    90,
		"Science": 89,
		"English": 99,
	}

	// Print all student scores
	fmt.Println("\nStudent Scores:")
	for _, student := range students {
		fmt.Println(student, "->", scores[student])
	}

	// Calculate average for each student
	fmt.Println("\nAverage Scores:")
	for _, student := range students {
		total := 0
		for _, subject := range subjects {
			total += scores[student][subject]
		}
		avg := total / len(subjects)
		fmt.Printf("%s: %d\n", student, avg)
	}

	// Remove a student (using slice + map)
	fmt.Println("\nRemoving Bob...")
	// Remove Bob from slice
	for i, s := range students {
		if s == "Bob" {
			students = append(students[:i], students[i+1:]...)
			break
		}
	}
	// Remove Bob from map
	delete(scores, "Bob")

	// Remove Alice
	fmt.Println("Removing Alice...")
	for i, s := range students {
		if s == "Alice" {
			students = append(students[:i], students[i+1:]...)
			break
		}
	}
	delete(scores, "Alice")

	fmt.Println("\nUpdated Student List:", students)
	fmt.Println("Updated Scores:", scores)
}
