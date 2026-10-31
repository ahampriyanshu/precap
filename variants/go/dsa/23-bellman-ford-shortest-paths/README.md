# Bellman–Ford shortest paths

Bellman–Ford relaxes every directed edge repeatedly. After i passes, distances cover paths of at most i edges. Without a reachable negative cycle, a cheapest path can be simple, so n-1 passes suffice.

```go
type Edge struct { From, To, Weight int }
e := Edge{From: 0, To: 1, Weight: 0}
fmt.Println(e.Weight) // zero can be a real edge cost
```

A further improvement from a reachable vertex proves a reachable negative cycle. An isolated negative cycle does not affect this source. Never relax from an unreachable sentinel; adding a negative edge to an invented infinity can manufacture a false route. The slower algorithm supports signed edge weights. Preserve caller-owned edge or matrix storage when building private working state. Public absence uses nil, avoiding magic finite integer sentinels. All finite costs and intermediate sums in these exercises fit int.

## Practice

Implement `Prototype(n int,edges [][3]int,source int) ([]*int,error)` by simple-path exploration and separate cycle inspection; `Solve` uses repeated relaxation plus one negative-cycle check pass. Directed edges are (from,to,weight). Return indexed minimum integer costs, nil for unreachable and pointer zero at source. Loops, parallel edges, signed weights are valid. Error for n<=0, invalid source/endpoints, or any source-reachable negative cycle. Unreachable negative cycles do not raise. Preserve input; sums fit int.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
