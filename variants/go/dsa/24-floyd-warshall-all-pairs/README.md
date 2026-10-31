# Floyd–Warshall all-pairs shortest paths

Floyd–Warshall grows the set of allowed intermediate vertices. At step k, compare the existing route i→j with i→k→j. The intermediate loop must remain outside the endpoint loops to preserve that subproblem order.

```go
type Edge struct { From, To, Weight int }
e := Edge{From: 0, To: 1, Weight: 0}
fmt.Println(e.Weight) // zero can be a real edge cost
```

Initialize diagonal zero and keep the cheapest parallel edge. Skip additions containing unreachable values. A negative diagonal afterward detects any negative cycle, including one in a disconnected component. O(V³) time and O(V²) storage suit modest dense graphs and all-pairs queries. Preserve caller-owned edge or matrix storage when building private working state. Public absence uses nil, avoiding magic finite integer sentinels. All finite costs and intermediate sums in these exercises fit int.

## Practice

Implement `Prototype(n int,edges [][3]int) ([][]*int,error)` by Bellman–Ford from each source; `Solve` uses Floyd–Warshall O(V³) time and O(V²) memory. Directed signed edges; keep cheapest parallel edge. Return n×n distance matrix with nil unreachable and pointer zero diagonal if no negative cycle. n=0 returns nonnil empty. Error for negative n, invalid endpoints, or any negative cycle. Preserve input.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
