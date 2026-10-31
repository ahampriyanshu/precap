# Rate Limiter

A sliding window owns accepted timestamps and an observed clock separately. Denials add no accepted event but still advance observed time. Therefore checking time only against the last accepted request misses regressions after a denial.

```go
now, window := 10, 4
acceptedAt := 6
fmt.Println(acceptedAt > now-window) // false: exact left boundary expired
```

Each client has an independent clock and budget. Reading history must not advance or expire anything; only a valid allow call does so. Explicit logical time makes tests deterministic and exposes boundary behavior without sleeping. This model is a strict sliding count window, unlike fixed windows or token buckets.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `AllowRequest(recent []int,limit,window,now int) (Decision,error)`. Positive limit/window, nonnegative now; history nonnegative nondecreasing and <=now, duplicates valid. Filter timestamps strictly >now-window. Allow and append now only when filtered length <limit; retain overfull unexpired history on denial. Preserve input.

Final: `NewSlidingWindowLimiter(limit,window) (*SlidingWindowLimiter,error)` validates settings. `Allow(client string,now int) (bool,error)` requires nonempty client and nonnegative nondecreasing per-client time, including denied calls. Error preserves observed time/history. Valid calls expire old accepted timestamps, decide and advance observed time. Clients have unrelated clocks. `History(client) ([]int,error)` validates client and returns a fresh retained history relative to its most recent valid Allow; unseen valid client empty. History never advances time.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
