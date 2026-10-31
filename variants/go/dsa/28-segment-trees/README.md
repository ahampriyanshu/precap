# Segment trees

A segment tree combines summaries of disjoint intervals. Minimum is associative, so a parent can combine two child minima. A point replacement repairs only its ancestors; a range query combines fully covered intervals.

```go
index := 6
lowbit := index & -index
fmt.Println(lowbit) // 2
```

Increasing the old minimum exposes why cached prefix minima cannot be subtracted or repaired by one local adjustment. Query identity can be internal infinity, while empty public output is nil. Build in O(n), then update/query in O(log n); no lazy propagation is needed for point replacements.

## Practice

Implement `Prototype(values []int,commands []Command) ([]*int,error)` by copying and scanning; `Solve` uses a segment tree. Command `set` uses A=index, B=replacement; `min` uses A=left, B=exclusive right. Return query results only in order; empty range returns nil optional minimum. Signed values valid. Unknown op, invalid update index, or range failing 0<=left<=right<=n returns error. Preserve both inputs including on error. Each optional result must remain independent of later updates.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
