# Arrays and linear scans

A slice is an ordered view over an array. Range gives an index and a copy of each value. Summaries need an explicit empty policy: zero is a valid maximum value, so absence is represented by a nil index pointer.

```go
readings := []int{6, 2, 6}
for index, value := range readings {
    fmt.Println(index, value)
}
```

A useful invariant states exactly what a summary knows about the consumed prefix. A strict improvement updates the first maximum; an equal value must keep the earlier index. Starting an extremum at zero would be wrong for a broader signed-input contract. A constant number of linear passes is still O(n), while sorting performs unnecessary ordering work. Real uses include request-size summaries and sensor aggregates; repeated range queries call for preprocessing instead.

## Practice

Implement `Prototype(loads []int) Summary` as a direct scan and `Solve` as one O(n) pass using O(1) summary state. Return `Total` and a pointer to the first maximum index. Nonnegative inputs; ties keep the smallest index. Empty input gives `{0,nil}` and `[0]` gives `{0,&0}`. Preserve input. All arithmetic fits `int`.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
