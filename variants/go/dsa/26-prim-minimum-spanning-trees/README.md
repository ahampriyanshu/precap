# Prim minimum spanning trees

Prim grows a connected component by its cheapest outgoing edge. Each unselected vertex stores the cheapest single connection into the selected set, rather than a total path distance.

```go
type Edge struct { From, To, Weight int }
e := Edge{From: 0, To: 1, Weight: 0}
fmt.Println(e.Weight) // zero can be a real edge cost
```

For a dense matrix, scanning a length-V frontier for each selection gives O(V²) time and O(V) extra space. An unreachable frontier means disconnected. Zero and negative edges are real costs; a nil pointer distinctly means no edge. Validate symmetry before relying on an undirected model. Preserve caller-owned edge or matrix storage when building private working state. Public absence uses nil, avoiding magic finite integer sentinels. All finite costs and intermediate sums in these exercises fit int.

## Practice

Implement `Prototype(costs [][]*int) (*int,error)` by converting the upper triangle to edges and using an MST method; `Solve` uses array-frontier Prim in O(V²) time and O(V) auxiliary memory. Matrix must be square and symmetric in optional values; validate before ignoring diagonal. nil means absent; zero/negative real costs valid. Return nil disconnected, pointer zero for empty graph. Shape/asymmetry return error. Preserve all rows and pointed-to values.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
