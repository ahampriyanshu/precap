# Prefix sums

Prefix sums store totals at boundaries: prefix[i] covers positions before i. The leading zero makes empty ranges and ranges starting at zero ordinary cases. Subtracting two boundary totals removes exactly the unwanted prefix, even when values are negative.

```go
left, right := 2, 2
fmt.Println(right-left) // an empty half-open range
```

Repeated scans cost O(nq), while preprocessing costs O(n) then each sum O(1). This is useful for immutable time-series totals. An update invalidates many prefixes; Fenwick trees handle interleaved updates. Prefix minima cannot be subtracted because minimum has no inverse. Validate bounds explicitly before indexing; Go indexing panics are not the documented error API.

## Practice

Implement `Prototype(values []int, queries [][2]int) ([]int,error)` with independent scans; `Solve` uses one prefix table in O(n+q) time and O(n) auxiliary space. Each query is `[left,right)`, with `0 <= left <= right <= len(values)`. Empty ranges total zero. Invalid bounds return a nonnil error. Preserve both inputs, including on error. Integers and results fit `int`.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
