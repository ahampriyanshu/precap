# 0/1 knapsack

0/1 selection differs from unlimited reuse. A one-dimensional table can hold the best value for each capacity, but update direction determines whether the current item can feed itself. The state must represent a decision prefix, not an unbounded choice pool.

```go
item := [2]int{3, 8}
weight, value := item[0], item[1]
fmt.Println(weight, value)
```

A heavier item with a larger value may still lose to two lighter items. Capacity means an upper bound, so unused space is legal. Integer capacity gives pseudo-polynomial O(nC) work; enormous capacities call for another representation or approximation. Tests that contain a single item and twice its weight catch accidental unbounded reuse.

## Practice

Implement `Prototype(items [][2]int,capacity int) (int,error)` with subset enumeration; `Solve` uses O(nC) DP time and O(C) space. Items are (positive weight,nonnegative value); capacity is nonnegative. Each input position may be chosen once, including duplicate tuples as separate items. Empty selection is allowed. Invalid input returns error; preserve input. Totals fit int.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
