# Transactional Key-Value Store

Nested transactions create a stack of visible views. An inner commit merges into its immediate parent, so an outer rollback must still undo that commit. Treating every commit as durable base storage breaks nesting.

```go
view := map[string]string{"empty": ""}
value, present := view["empty"]
fmt.Println(value, present) // empty string is present
```

A copied-map prototype makes ownership easy to reason about at O(number of keys) per begin. Overlay maps with deletion markers can reduce copying but make lookups and merges more subtle. Deletion must hide a parent key rather than falling through to it. Return snapshots must not expose any live frame. This exercise defines nesting behavior, without concurrency or durability claims.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `NewKeyValueStore() *KeyValueStore`; `Set(key,value string)`, `Get(key) *string`, `Delete(key) bool`. Empty keys/values valid; nil means absent, empty string pointer means present.

Final: `NewTransactionalStore() *TransactionalStore` supports the same CRUD plus `Begin() int`, `Commit() (int,error)`, `Rollback() (int,error)`, `Depth() int`. Begin starts a nested visible view; commit closes only innermost into parent, rollback discards only innermost. Return resulting depth. Commit/rollback at base error unchanged. `Snapshot(prefix string) map[string]string` returns a fresh current-view map filtered by exact prefix; empty prefix matches all. Go map key iteration is unordered; key order is not part of this variant. Reads include uncommitted writes/deletions. No type conversion or clocks.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
