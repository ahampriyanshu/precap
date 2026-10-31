# Sliding windows with counts

A window maintains counts for exactly one contiguous range. When a new label breaches the distinct-value budget, advance the left boundary until valid again. Remove zero-count keys so map size still represents distinct values.

```go
counts := map[string]int{"api": 1}
counts["api"]--
if counts["api"] == 0 { delete(counts, "api") }
```

Each boundary moves forward at most n times; the inner shrink loop therefore stays linear overall. Keeping a historical set rather than live counts fails when labels leave. This model suits bounded working sets and recent-event analysis, while noncontiguous selections need another algorithm.

## Practice

Implement `Prototype(labels []string, limit int) (int,error)` by enumerating ranges; `Solve` uses one moving window and frequency map for expected O(n) time. Return the longest contiguous range with at most limit exact distinct labels. Empty input or zero limit returns zero. Negative limit returns error before mutation. Preserve input.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
