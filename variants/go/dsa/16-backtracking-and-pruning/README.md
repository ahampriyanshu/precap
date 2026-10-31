# Backtracking and pruning

Backtracking grows a partial assignment, rejecting it as soon as it violates uniqueness. After exploring a choice, undo its effect before a sibling branch. A shared used set represents only the current path.

```go
used := map[string]bool{"worker-a": true}
delete(used, "worker-a") // rollback a path-local choice
```

Input-position order determines the output tuple. Reordering variables may improve search but changes how the lexicographically first answer is found. Sorted unique alternatives and depth-first traversal provide a canonical result. Returning the working slice directly can let later rollback corrupt a saved answer; copy at the ownership boundary. Assignment and configuration searches commonly use this pattern.

## Practice

Implement `Prototype(allowed [][]string) []string` by enumerating combinations; `Solve` backtracks over sorted unique choices with early rejection and rollback. Pick one string per input position with no repetition, returning the lexicographically smallest complete assignment. Return nil for impossible; an empty outer slice returns a nonnil empty slice. Exact strings; preserve every inner slice. Worst case is exponential.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
