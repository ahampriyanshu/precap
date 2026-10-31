# Greedy interval scheduling

Earliest finish leaves the largest remaining time horizon. An exchange argument replaces the first job of an optimal schedule with the no-later finishing greedy choice without reducing the number of later jobs. Earliest start and shortest duration do not provide the same guarantee.

```go
a := Job{ID: "first", Start: 0, End: 2}
b := Job{ID: "next", Start: 2, End: 3}
fmt.Println(b.Start >= a.End) // touching is compatible
```

Tie ordering creates a reproducible optimum even when several schedules have equal cardinality. Validate the complete inventory before selecting anything; duplicate identities make output ambiguous. This models one exclusive resource with equal-value jobs. Weighted jobs or multiple resources require different optimization.

## Practice

Implement `Prototype(jobs []Job) ([]string,error)` by exploring subsets and reproducing the canonical optimum. `Solve` sorts by (End,Start,ID) and accepts starts >= last accepted end, O(n log n). IDs must be unique and End > Start, otherwise error. Touching jobs are compatible. Return accepted IDs in selection order, not input order. Empty input gives empty slice. Preserve input on success/error.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
