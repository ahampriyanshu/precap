package main

type OwnedSource interface {
	ReadAll() ([]byte, error)
	Close() error
}

func Prototype(s OwnedSource) ([]byte, error)      { panic("Implement Prototype in exercise.go") }
func Solve(s OwnedSource) (data []byte, err error) { panic("Implement Solve in exercise.go") }
