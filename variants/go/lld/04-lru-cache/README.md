# LRU Cache

Least recently used eviction couples a lookup table with a recency order. Hits and updates move one existing entry to the most recent end; misses do not invent recency. A cache entry is owned once even after repeated updates.

```go
values := map[string]int{"offset": 0}
v, found := values["offset"]
fmt.Println(v, found) // zero remains a present value
```

A map plus doubly linked list can make lookup, refresh, and eviction O(1). A slice is a useful prototype but moving keys is linear. Capacity zero is a valid disabled cache. Read snapshots must not refresh entries. The Go variant uses an optional integer result and an explicit default argument, preserving the distinction between a cached zero and a miss.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `TouchOrder(keys []string,key string) []string` returns a new oldest-to-newest slice, moving an existing key to end or appending new. Inputs are valid distinct nonempty keys.

Final: `NewLRUCache(capacity int) (*LRUCache,error)` requires nonnegative capacity. `Put(key string,value int) error` validates nonempty key, inserts/updates and refreshes, then evicts least recent if necessary; capacity zero is no-op after validation. `Get(key string,fallback *int) (*int,error)` validates key, refreshes a hit and returns detached value; miss returns the supplied fallback pointer unchanged (including identity), without recency change. `Delete(key) (bool,error)` validates and removes once. `Items() []CacheItem` returns detached least-to-most order. Negative values and zero valid; target O(1) final operations with a map and linked order.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
