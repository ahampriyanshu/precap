package main

import "context"

func Prototype(ctx context.Context, in <-chan int, out chan<- int) error {
	panic("Implement Prototype in exercise.go")
}
func Solve(ctx context.Context, in <-chan int) (<-chan int, <-chan error) {
	panic("Implement Solve in exercise.go")
}
