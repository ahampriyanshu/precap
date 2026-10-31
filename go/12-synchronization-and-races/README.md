# Synchronization and race-free state

A data race occurs when goroutines access the same memory concurrently, at least one access writes, and there is no sufficient synchronization. Race-free execution is a correctness requirement, not only a performance concern. Concurrent writes to a map can crash; even scalar increments like count++ are a read-modify-write sequence that can lose updates without coordination.

```go
var mu sync.Mutex
count := 0
mu.Lock()
count++
mu.Unlock()
```

## Protect an invariant, not an isolated line

A mutex guards a collection of state and the relationships between its fields. Decide which lock owns every field, then acquire it for every access that participates in the invariant. Locking only writes while reads remain unprotected is still a race. A snapshot needs a coherent view of the complete map, not a sequence of independently synchronized reads that can represent different instants.

The zero value of sync.Mutex is usable. A map inside a zero-value service is nil, so initialize it while holding the same lock before its first write. Do not copy a mutex after use: copying a struct containing one can create independent locks protecting the same referenced data, or copy locked state. Use pointer receivers and return snapshots without embedded locks. RWMutex can allow concurrent readers, but it adds policy and overhead; choose it based on workload and measurement.

Atomic operations suit independent numeric or pointer state and particular lock-free protocols. They do not make a multi-key map update atomic or automatically preserve a cross-field invariant. Channels can instead transfer ownership to a single state-owning goroutine; that design still needs request/reply and shutdown lifetimes. Prefer the clearest correct ownership model before optimizing contention.

## Snapshots and drains have linearization points

A method is atomic in this exercise if callers can regard its effect as happening at one instant between call and return. Drain reads all current counts and resets them in the same critical operation, so increments cannot vanish between a read and a later reset. A returned snapshot or drained map belongs to the caller and must not share future service storage. Negative deltas are allowed and still preserve exact per-key arithmetic.

Test with a start barrier and WaitGroup so many writers are active, and assert conservation of all submitted increments across concurrent drains. Do not rely on sleeping for an assumed interleaving. The race detector instruments accesses on exercised paths and is valuable evidence; it does not prove linearizability by itself, which is why behavioral totals and snapshot isolation remain necessary. Performance analysis should then measure contention and determine whether sharding or a state-owning goroutine is warranted.

## Practice

Prototype: `Prototype(events []Event) map[string]int` processes signed deltas serially, includes every encountered key even if its final value is zero, returns a fresh nonnil map, preserves events. Empty key is valid.

Final: `Counter` must be usable as its zero value. `Add(key string,delta int) int` atomically adds signed delta, creates key even for zero, returns its new value. `Get(key) int` zero for missing, no creation. `Snapshot() map[string]int` coherent fresh nonnil map. `Drain() map[string]int` atomically returns detached map of all current entries then resets to empty. Every method is safe concurrently; operations must not lose increments and no shared returned map may expose internal mutable state. Do not copy Counter after use. Arithmetic fits int. All final tests should also pass under `go run -race main.go exercise.go --stage final`.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics from direct calls and harness-owned goroutines as named failures, including `panic(nil)`. A panic in a goroutine started by your implementation must be recovered in that goroutine; its caller cannot recover it, and an unhandled panic can terminate the process. Cancellation is cooperative; the local CLI timeout remains the hard stop for unfinished waits. Tests exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
