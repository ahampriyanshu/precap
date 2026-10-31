package main

type ValueReader interface{ ReadValue() (int, error) }
type ScaledReader struct {
	Source ValueReader
	Factor int
}

func Prototype(a []ValueReader) ([]int, error)  { panic("Implement Prototype in exercise.go") }
func Solve(a []ValueReader) ([]int, error)      { panic("Implement Solve in exercise.go") }
func (r *ScaledReader) ReadValue() (int, error) { panic("Implement ReadValue in exercise.go") }
