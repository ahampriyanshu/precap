# Graphs and breadth-first search

Breadth-first search discovers shortest unweighted paths in layers. Mark vertices when enqueuing, not after dequeue, to avoid duplicate frontier entries. Undirected edges need adjacency in both directions.

```go
type Edge struct { From, To, Weight int }
e := Edge{From: 0, To: 1, Weight: 0}
fmt.Println(e.Weight) // zero can be a real edge cost
```

A FIFO frontier makes the first discovered hop count minimal. Parallel edges and self-loops do not change distances. DFS finds reachability but its first path need not be shortest. Use BFS for fewest transitions; weighted costs require another frontier policy. Preserve caller-owned edge or matrix storage when building private working state. Public absence uses nil, avoiding magic finite integer sentinels. All finite costs and intermediate sums in these exercises fit int.

## Practice

Implement `Prototype(n int,edges [][2]int,source int) ([]*int,error)` by enumerating simple paths; `Solve` uses adjacency-list BFS in O(V+E). Undirected edges permit loops/duplicates. Return vertex-indexed hop counts, pointer zero at source and nil for unreachable. Error for n<=0, invalid source or endpoints. Preserve edges, including on error.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
