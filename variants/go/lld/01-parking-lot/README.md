# Parking Lot

Allocation combines two orderings: compatibility by vehicle size, then a deterministic tie by spot ID. Treat inventory, active tickets, and active vehicles as one state machine: a successful park adds all associated state, and release removes it exactly once. Validation must precede searching so an invalid unused spot cannot slip through.

```go
type Size int
const (Motorcycle Size = iota; Car; Van)
fmt.Println(Car < Van) // ranks make compatibility explicit
```

A ticket number is a successful-operation sequence, not an attempt counter. Capacity failure must leave the number available. Returning a pointer into internal ticket storage would let callers release or rename a vehicle indirectly; return a copied Ticket instead. The same principle applies to availability views.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `ChooseSpot(spots []Spot,kind string) (*string,error)` selects the smallest compatible kind, then smallest ID, or nil. All spots are free. IDs nonempty and unique; kinds exactly motorcycle, car, van in that rank order. Validate every spot and request; preserve input.

Final: `NewParkingLot(spots) (*ParkingLot,error)` copies validated inventory (empty allowed). `Park(vehicle,kind) (*Ticket,error)` validates nonempty vehicle/kind and rejects an already active vehicle with error, even if capacity is exhausted. No free compatible spot returns nil without error. Ticket IDs start at 1 and advance only on success. `Release(id) *Ticket` frees an active integer ticket once, nil otherwise. `ActiveTickets() []Ticket` sorts by numeric ticket ID; `AvailableSpots() []Spot` sorts rank then ID. Released vehicles may park again; released ticket IDs remain inactive.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
