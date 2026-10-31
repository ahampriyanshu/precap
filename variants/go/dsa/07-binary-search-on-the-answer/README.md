# Binary search on the answer

Binary search applies to a monotone feasibility predicate, not only to a sorted input slice. If a capacity works, every larger capacity works. The maximum single weight is a lower bound and total weight an upper bound.

```go
lo, hi := 5, 20
mid := lo + (hi-lo)/2 // avoid adding the two bounds
fmt.Println(mid)
```

The feasibility scan greedily fills one contiguous group before opening another. Sorting would change the required order. Test boundary capacities and excess-day cases; the off-by-one usually lies in choosing the first feasible result. This pattern also models bounded batches and time budgets when feasibility is monotone.

## Practice

Implement `Prototype(weights []int, days int) (int,error)` by testing capacities; `Solve` binary-searches the first feasible capacity. Preserve order and partition positive weights into at most days nonempty contiguous groups. Extra days may remain unused. Empty weights returns zero for positive days. Nonpositive days or weights return error. Use O(1) auxiliary space; sums fit int.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
