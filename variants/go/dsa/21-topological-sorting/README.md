# Topological sorting

A topological ordering respects every directed dependency. Zero-indegree vertices are currently legal; removing one releases its outgoing dependencies. A smallest-first frontier gives the lexicographically smallest ordering.

```go
type Edge struct { From, To, Weight int }
e := Edge{From: 0, To: 1, Weight: 0}
fmt.Println(e.Weight) // zero can be a real edge cost
```

Deduplicate edges before counting indegrees or decrements must track the same multiplicity. If fewer than n vertices can be removed, a cycle remains, even in a disconnected component. This models build ordering and dependency execution; BFS layers alone do not encode directed prerequisites. Preserve caller-owned edge or matrix storage when building private working state. Public absence uses nil, avoiding magic finite integer sentinels. All finite costs and intermediate sums in these exercises fit int.

## Practice

Implement `Prototype(n int,edges [][2]int) ([]int,error)` by lexicographic permutations; `Solve` uses indegrees and smallest-first legal frontier. Deduplicate directed edges. Return lexicographically smallest complete ordering, nil on cycle, nonnil empty for n=0. Negative n or invalid endpoints returns error. Preserve edges; cycles are an ordinary nil result rather than an error.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
