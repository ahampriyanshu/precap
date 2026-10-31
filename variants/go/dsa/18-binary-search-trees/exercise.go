package main

type BSTCommand struct {
	Op  string
	Key int
}
type BSTResult struct {
	Kind  string
	Bool  bool
	Value *int
}

func Prototype(commands []BSTCommand) ([]BSTResult, error) { panic("Implement prototype") }
func Solve(commands []BSTCommand) ([]BSTResult, error)     { panic("Implement final") }
