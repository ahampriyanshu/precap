# Binary trees and level-order traversal

Breadth-first traversal visits one depth before the next. A queue preserves left-to-right discovery if children are enqueued left then right. A stack instead follows depth-first order.

```go
root := &Tree{Name: "root", Left: &Tree{Name: "left"}}
fmt.Println(root.Left.Name)
```

Capture the current frontier size before adding children or next-level nodes can leak into the current row. A slice queue with an advancing head avoids repeated copying, but consumed pointers may retain memory; clearing slots or rotating frontier buffers prevents unnecessary retention. Use level order for breadth reports and shortest unweighted-tree depths; recursion is often simpler for subtree summaries.

## Practice

Implement `Prototype(tree *Tree) [][]string` by collecting each depth separately; `Solve` processes a queue frontier in O(n) time, O(w) active frontier storage excluding result. Nil root returns nonnil empty slice. Nodes have unique names, no cycles/shared children. Return left-to-right names grouped by depth. Preserve every node and link. Struct pointers replace recursive tuple nodes.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
