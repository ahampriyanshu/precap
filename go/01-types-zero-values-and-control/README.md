# Types, zero values, and control flow

Go assigns a static type to every variable. A declaration can name the type explicitly (`var retries int`) or infer it (`retries := 3`). Inference does not make the variable dynamically typed: assigning a string later remains a compile error. Constants are more flexible than variables until a context gives them a type. Conversion such as `int64(retries)` is explicit, and converting a larger value to a smaller integer type can truncate rather than return an error. Choose widths at storage or wire boundaries; `int` is convenient for indexing but its size follows the target architecture.

## Zero values are part of the design

Uninitialized integers are zero, booleans false, strings empty, pointers/maps/slices/channels nil, and structs recursively contain their fields' zero values. A zero value is useful when it represents an ordinary safe state. It cannot always represent absence: zero is a real measurement. Pair a value with a boolean or use an optional pointer when missing and zero differ. Never dereference a nil pointer.

```go
var attempts int
var enabled bool
var name string
var optional *int
fmt.Println(attempts, enabled, name == "", optional == nil)
```

## Conditions describe the domain

Go has no truthiness conversion: `if attempts` does not compile; write `if attempts > 0`. An if initializer limits a temporary to its condition and branches, for example `if value, ok := values[key]; ok { ... }`. A switch selects one branch without implicit fallthrough. Use explicit cases for known states and a default error for unsupported input when the contract requires one. Rejecting impossible states early keeps the remaining loop invariant simple.

`for` handles counting, condition-controlled loops, and unbounded loops. Range over a slice yields an index and a copied element. Modifying the copied element does not update the original struct in the slice; use the index or a pointer when mutation is intended. `break` leaves the nearest loop; `continue` starts the next iteration. Nested loops sometimes need labels, but extracting a small function can make the exit condition clearer.

## Summaries need an invariant

A running total summarizes only the valid measurements already read. A first valid value establishes extrema; later improvements update them. Initializing minimum to zero would invent an observation when every valid value is positive. Counting invalid records by accident can corrupt an average even when the total is correct. The empty/all-invalid input contract must therefore be explicit.

These rules matter in request validation, metrics aggregation and configuration handling. Integer overflow is not automatically a checked error, so production code needs bounds or an explicitly checked arithmetic policy. This exercise keeps every intermediate total within `int` and focuses on static state, zero values, and control flow. A fixed number of passes remains O(n), while one pass keeps the summary local.

## Practice

Implement `Prototype(readings []Reading) Summary` using direct scans, then `Solve` in one pass. Only readings with Valid=true participate. Summary contains Count, Total, and optional Minimum/Maximum pointers. Empty or all-invalid input returns Count/Total zero and nil extrema. A valid zero remains pointer zero. Signed values and ties are valid; all sums fit int. Preserve input and return independent extrema pointers. Both stages return identical results; final uses O(n) time and O(1) summary state. The provided structs specify the API.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
