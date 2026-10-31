# Memory, garbage collection, and performance

Go manages memory with garbage collection, but reachable data remains live even when an application no longer needs it. A small slice can retain a large backing array; a stale pointer in an unused tail slot can retain an entire object graph. Memory-safe code can therefore still waste substantial memory. Ownership and reference lifetime are performance concerns as well as correctness concerns.

```go
large := make([]byte, 1<<20)
view := large[:8]
owned := make([]byte, len(view))
copy(owned, view)
fmt.Println(len(owned), cap(owned)) // 8 8, independent allocation
```

## Stack and heap are compiler decisions

Returning the address of a local variable is safe: escape analysis arranges an appropriate lifetime. An interface conversion, closure capture or pointer return can affect placement, but source syntax alone does not prove an allocation. Inspect compiler escape diagnostics when investigating, then measure a representative benchmark. Do not contort a simple value API merely to avoid an allocation you have not observed.

GC cost depends on allocation rate, live heap size and pointer scanning work. Reusing buffers can reduce allocations but introduces aliasing and retention risks. A pool is not a durable cache: pooled items may disappear, and its value needs reset before reuse. Never return a pooled buffer to a caller while also returning it to the pool. A correct detached copy can be cheaper overall than debugging corrupted shared buffers.

## Capacity and clearing solve different problems

A full slice expression restricts future appends through one descriptor; it does not copy its existing elements or release its original backing array. Copy a retained byte range into a tight allocation when the API promises independence and avoids retaining unrelated source bytes. Even an empty successful range should follow the specified nil/empty contract.

When shrinking a pointer slice, clearing the removed slots releases references held by the backing array. A shorter length alone may leave those references reachable from another view or a retained allocation. Validate the keep count before clearing so errors preserve data. Returning a limited-capacity prefix prevents an append through the new view from overwriting cleared tail storage, but its retained prefix elements deliberately preserve pointer identity.

## Optimize with evidence

Use benchmarks with allocation reporting to compare realistic workloads. CPU and heap profiles identify where resources are spent; microbenchmarks of isolated operations can mislead when production bottlenecks are I/O, contention or retained data. Keep correctness tests separate from fragile elapsed-time thresholds. A benchmark improvement needs a baseline, stable input and a clear tradeoff in memory or complexity.

The exercise asserts ownership, exact visible capacity and cleared references instead of forcing GC or expecting a fixed heap count. Those are deterministic API properties. They supply evidence about retention behavior without pretending to prove a particular collector schedule or allocation count on every compiler.

## Practice

Prototype: `Prototype(source []byte,ranges [][2]int) ([][]byte,error)` returns one owned copy of each half-open [left,right) range, in order. `Solve` same API with every result's capacity exactly its length, including nonnil empty ranges. Validate 0<=left<=right<=len(source); any invalid range returns nil/error, preserving source/ranges. Outer successful output nonnil even empty. Overlapping ranges must not alias one another or input. Final O(total copied bytes + number of ranges).

Also final: `TrimPointers(items []*Payload,keep int) ([]*Payload,error)` requires 0<=keep<=len(items), validates before mutation, clears every original slot at index>=keep to nil, and returns the original prefix (same retained pointer identities) with len=cap=keep. This function deliberately mutates caller-owned tail slots. Retained Payload data is borrowed, not deep-copied. Nil items with keep=0 may return nil. Invalid keep returns nil/error with every pointer unchanged. No runtime.GC calls or timing assumptions are needed.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
