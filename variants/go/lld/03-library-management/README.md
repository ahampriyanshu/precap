# Library Management System

A title identifies a logical work; a copy identifies one lendable physical instance. Multiple copies of the same title may be loaned to different members, but a member's active title constraint spans every copy.

```go
type CopyID string
first, second := CopyID("C1"), CopyID("C2")
fmt.Println(first != second) // distinct copies can share a title
```

Check duplicate member-title ownership before checking availability, so exhaustion does not hide an invalid duplicate request. Return operations need the current loan owner; unknown and already returned copies are harmless misses, while another owner's return is an error. Store immutable inventory separately from mutable loans. Deterministic smallest-copy allocation keeps behavior reproducible.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `AvailableCopies(copies []AvailableCopy,title string) []string` returns sorted free IDs for an exact title, preserving inputs. Inputs satisfy uniqueness and validity.

Final: `NewLibrary([]BookCopy) (*Library,error)` copies unique nonempty copy IDs and nonempty titles, empty catalog allowed. Nonempty member/title/copy IDs required in methods; invalid IDs error before mutation. `Borrow(member,title) (*string,error)` errors if member already holds that exact title, otherwise smallest free ID or nil if none. `ReturnCopy(copyID,member) (bool,error)` false for absent/unloaned copy, error if loan belongs to another member, true after release. `Available(title) ([]string,error)` sorted free IDs. `Loans() []Loan` sorted by CopyID and detached. No catalog edits or due dates.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
