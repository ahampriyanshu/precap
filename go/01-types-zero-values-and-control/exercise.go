package main

type Reading struct {
	Value int
	Valid bool
}
type Summary struct {
	Count, Total     int
	Minimum, Maximum *int
}

func Prototype(a []Reading) Summary { panic("Implement Prototype in exercise.go") }
func Solve(a []Reading) Summary     { panic("Implement Solve in exercise.go") }
