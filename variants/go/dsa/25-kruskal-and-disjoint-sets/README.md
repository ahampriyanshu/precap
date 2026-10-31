# Kruskal and disjoint sets

Kruskal processes undirected edges from cheapest upward. Accept an edge only when its endpoints currently belong to different components. A disjoint-set structure makes that connectivity query cheap.

```go
type Edge struct { From, To, Weight int }
e := Edge{From: 0, To: 1, Weight: 0}
fmt.Println(e.Weight) // zero can be a real edge cost
```

Union by size/rank and path compression keep DSU paths short. Join roots rather than arbitrary endpoints. DSU parent links are bookkeeping, not the chosen graph edges. The cut property justifies each accepted cheapest connection; negative weights do not invalidate it. Preserve caller-owned edge or matrix storage when building private working state. Public absence uses nil, avoiding magic finite integer sentinels. All finite costs and intermediate sums in these exercises fit int.

## Practice

Implement `Prototype(n int,edges [][3]int) (*MST,error)` using sorted candidates plus DFS connectivity; `Solve` uses DSU with compression and size/rank. Normalize undirected endpoints (min,max,weight), sort by (weight,min,max), accept noncycles in that order. Signed weights valid. Return nil if disconnected, `{0,[]}` for valid n=0/1. Error for negative n or invalid endpoints. Preserve input; accepted edges are detached storage.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
