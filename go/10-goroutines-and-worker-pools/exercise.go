package main

import "context"

type Transform func(context.Context, int) (int, error)

func Prototype(ctx context.Context, a []int, w int, f Transform) ([]int, error) {
	panic("Implement Prototype in exercise.go")
}
func Solve(parent context.Context, a []int, w int, f Transform) ([]int, error) {
	panic("Implement Solve in exercise.go")
}
