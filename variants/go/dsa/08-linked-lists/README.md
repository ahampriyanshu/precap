# Linked lists and node identity

Linked-list identity makes the problem stronger than returning equal values. A pointer names an existing node; copying its fields creates a different object. Removing a node changes a predecessor link rather than shifting later values.

```go
tail := &Node{Value: 3}
head := &Node{Value: 1, Next: tail}
fmt.Println(head.Next == tail) // pointer identity
```

Head removal has no ordinary predecessor, so a sentinel can unify cases. Advance the predecessor only when retaining its next node; otherwise consecutive removals get skipped. This matters in intrusive queues and identity-sensitive indexes. A slice is often simpler when node identity is irrelevant.

## Practice

Implement `Prototype(values,blocked []int) []int` by filtering, then `Solve` with the same value result. Preserve both slices. Also implement `Detach(head *Node, blocked map[int]bool) *Node` in both stages. Relink existing nodes only; surviving pointers and order must be identical, result acyclic and tail nil. Map keys with true values are blocked; do not mutate it. Nil head or complete removal returns nil; a temporary sentinel is allowed.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
