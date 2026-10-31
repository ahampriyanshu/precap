# Monotonic deques

A decreasing deque stores only indices still capable of becoming a window maximum. An older smaller candidate is dominated by a newer larger one, which also expires later. Indices are necessary to know when a candidate leaves.

```go
indices := []int{1, 3}
leftBoundary := 2
if len(indices)>0 && indices[0]<leftBoundary { indices=indices[1:] }
```

Each index enters once and leaves at most once, yielding amortized O(n) work despite a nested cleanup loop. Equal maxima need a deliberate keep-or-replace policy, but the output value is the same. This suits rolling peaks; it does not provide arbitrary range queries or support changes to old positions.

## Practice

Implement `Prototype(loads []int,width int) ([]int,error)` by scanning windows; `Solve` uses a monotonic deque of indices, O(n) time and O(width) auxiliary space. Return maxima for full windows in starting order. Empty input or width above length yields empty slice. Width <= 0 returns error even on empty input. Signed values and ties are valid. Preserve input.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
