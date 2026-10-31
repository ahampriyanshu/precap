# File Storage System

Quota is owned by stored entries, including copies. Copying metadata does not share its quota charge; deleting one name must not free another name's bytes. Absolute expiry belongs to the stored object and copying it does not restart its TTL.

```go
createdAt, ttl := 2, 5
absoluteExpiry := createdAt + ttl
fmt.Println(absoluteExpiry) // 7, even if metadata is copied at time 4
```

Time advances only through AdvanceTo, keeping reads and searches predictable. Expiry and deletion each release usage once. Validate metadata before duplicate or quota checks so invalid attempts cannot be hidden by capacity failures. Empty files remain real entries even with zero quota; absence cannot be represented by size zero.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `NewFileCatalog() *FileCatalog`; `Upload(name string,size int) (bool,error)` nonempty name/nonnegative size, duplicate false preserving size; `Get(name) *int` nil missing, pointer zero valid.

Final: `NewFileStorage(quota int) (*FileStorage,error)` nonnegative quota, time/usage zero. `AdvanceTo(ts int) error` requires nonnegative nondecreasing time, equal valid; delete all expiry<=ts and release usage. No other method advances time. `Upload(name string,size int,ttl *int) (bool,error)` validates nonempty name, nonnegative size, positive supplied TTL before duplicate/quota; nil TTL permanent, else current+ttl. Duplicate or insufficient quota false unchanged. `Get(name) *File` detached optional expiry. `Copy(source,destination) (bool,error)` validates nonempty destination first; missing source/existing destination/same name/insufficient quota false; success copies size and absolute expiry, charges again. `Delete(name) bool` release once. `Usage() int`. `Search(prefix string,limit int) ([]File,error)` exact prefix, sort size descending/name ascending; negative error, zero empty. Explicit limit (use 10 for customary default). Expired names reusable.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
