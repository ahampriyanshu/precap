# Binary search trees

Each BST node divides keys into strictly smaller and strictly larger subtrees. Searching follows only one branch. Floor search remembers the best <= candidate when moving right. Removal must handle zero, one, and two children while preserving the ordering invariant.

```go
type SearchNode struct { Key int; Left,Right *SearchNode }
root := &SearchNode{Key: 4}
fmt.Println(root.Left == nil)
```

A two-child deletion usually substitutes the in-order successor and then removes that successor from its original position. Merely clearing one link can lose an entire subtree. A plain BST is not automatically balanced; sorted insertion can make it a chain. The tagged result struct replaces a dynamically mixed result list while keeping boolean values distinct from optional integer floors.

## Practice

Implement `Prototype(commands []BSTCommand) ([]BSTResult,error)` with an unsorted unique-key list; `Solve` implements a BST including deletion and floor. Start empty. add/remove report whether membership changed; contains reports membership. Encode these as `{Kind:"bool",Bool:...}` with nil Value. floor returns `{Kind:"floor",Value:&key}` or nil Value; Bool stays false. Unknown operation returns error. Preserve commands. An unbalanced BST may have linear height.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
