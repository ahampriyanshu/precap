# Slices, maps, and ownership

An array owns a fixed number of elements and is copied by value. A slice is a small descriptor containing an array pointer, length and capacity. Assigning a slice copies that descriptor, so two slices can view the same elements. Map assignment similarly shares a reference to the same map storage. The key question at an API boundary is therefore who owns the reachable mutable data, not merely whether a top-level value was assigned.

```go
source := []int{1, 2, 3}
view := source[:2]
view[0] = 9
fmt.Println(source[0]) // 9: shared backing array
owned := append([]int{}, source...)
owned[0] = 7
fmt.Println(source[0]) // still 9
```

## Length and capacity have different jobs

Length controls indexing; capacity determines whether append can reuse an existing backing array. A tiny view may retain a huge original array. A full slice expression `view[:len(view):len(view)]` prevents an append through that view from overwriting later elements, but existing elements still alias and the original allocation remains reachable. Copy when independent ownership or retention release is required.

`make([]T,n)` creates length n zero elements; `make([]T,0,n)` reserves capacity for later appends. Appending to the first form adds elements after the existing zeros. Nil slices can be ranged, indexed only within bounds, and appended to. Empty and nil slices often behave alike but serialize differently; APIs should specify whether callers can distinguish them.

## Maps need explicit initialization and lookup policy

Reading a missing map key returns the zero element value. The comma-ok form distinguishes missing from a stored zero. Reading a nil map is safe; assigning into one panics. Use make or a map literal before writing. Map iteration order is unspecified, so sort keys for ordered output. Maps are not safe for concurrent read/write without synchronization.

A shallow map copy duplicates the key/value slots but not slice values. To return a detached `map[string][]int`, allocate a new map and copy each nested slice. The same ownership rule applies to nested structs with slice fields. Error handling must preserve caller storage too: a function that mutates shared state and then notices an invalid index has already broken its contract.

These details appear in request payload normalization, configuration snapshots and caches. Tests should mutate returned nested storage and original input after the call, because value equality immediately after copying cannot prove ownership. This exercise separates validation and application from caller memory.

## Practice

Implement `Prototype(source map[string][]int,patches []Patch) (map[string][]int,error)` with an explicit deep copy, then `Solve` with the same ownership contract. Each Patch replaces one existing key's element at Index with Value. Keys may be empty. Reject unknown keys or indices outside the key's slice, returning nil and nonnil error. Repeated patches apply in order; nil source with no patches yields a nonnil empty map. Preserve the original map, all nested slices and patches on success/error. Returned nested slices must neither alias input nor one another, even when two input keys shared storage. Final O(total stored elements + patches) time. Empty nested results are nonnil.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
