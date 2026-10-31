# Dijkstra shortest paths

Dijkstra settles the cheapest tentative distance when weights are nonnegative. A min-heap avoids scanning every unvisited vertex. A cheaper route may add another heap entry rather than updating an old one.

```go
type Edge struct { From, To, Weight int }
e := Edge{From: 0, To: 1, Weight: 0}
fmt.Println(e.Weight) // zero can be a real edge cost
```

Discard stale entries whose distance no longer equals the current best. Zero edges are valid; negative edges invalidate the settlement proof. Validate all edges, including unreachable components. This algorithm minimizes path cost, not total network connection cost. Preserve caller-owned edge or matrix storage when building private working state. Public absence uses nil, avoiding magic finite integer sentinels. All finite costs and intermediate sums in these exercises fit int.

## Practice

Implement `Prototype(n int,edges [][3]int,source int) ([]*int,error)` by simple-path exploration; `Solve` uses Dijkstra with a min-heap and stale-entry rejection. Directed edges are (from,to,weight). Return indexed minimum integer costs, nil for unreachable and pointer zero at source. Loops, parallel edges, zero weights are valid. Error for n<=0, invalid source/endpoints, or any negative edge, including unreachable edges. Preserve input; sums fit int.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
