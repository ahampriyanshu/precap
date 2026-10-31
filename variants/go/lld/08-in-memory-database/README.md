# In-Memory Database

A field's history is an ordered timeline, not a stack of values to fall back through. The latest version at a historical instant owns that instant even if its lifetime has expired. An expired replacement never resurrects an older indefinite value.

```go
writtenAt, ttl := 4, 3
expiresAt := writtenAt + ttl
fmt.Println(7 < expiresAt) // false: expiry boundary is absent
```

Logical time is accepted by reads and unsuccessful conditionals as well as writes. Validate TTL and lookback bounds before accepting time, or an invalid operation can wrongly prevent a later legitimate call. Equal timestamps need processing order to break ties. A deletion marker preserves history while making current reads absent. Copy scan results so historical state remains protected.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `NewRecordStore()`, `Set(key,field,value string)`, `Get(key,field) *string`, `Scan(key,prefix) []Field` sorted by field name. Empty strings allowed, nil absent.

Final: `NewTemporalDatabase()`. Every public timed method accepts nonnegative nondecreasing ts, equal allowed; a valid read or unsuccessful mutation advances accepted time. Invalid arguments preserve history and time. `Set(ts int,key,field,value string,ttl *int) error` writes a version; nil TTL permanent, positive TTL visible on [ts,ts+ttl). `Get(ts,key,field) (*string,error)`, `Delete(ts,key,field) (bool,error)` append tombstone only if currently visible. `CompareAndSet(ts,key,field,expected,value,ttl) (bool,error)` validates TTL even on failed comparison; matching visible value writes new lifetime. `Scan(ts,key,prefix) ([]Field,error)` sorted visible fields. `GetAt(ts,key,field,at) (*string,error)` requires 0<=at<=ts before advancing ts and reads the last processed version with timestamp<=at. Last same-time operation wins; expiry/tombstone never reveal older versions. All keys/fields/values may be empty.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
