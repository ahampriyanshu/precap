package main

type Node struct {
	Value int
	Next  *Node
}

func Prototype(values []int, blocked []int) []int   { panic("Implement prototype") }
func Solve(values []int, blocked []int) []int       { panic("Implement final") }
func Detach(head *Node, blocked map[int]bool) *Node { panic("Implement identity-preserving detach") }
