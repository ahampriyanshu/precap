# Vending Machine

A sale transfers ownership of credit and decrements one stock count together. Validate the selected product, stock, and payment before changing any of them. Refunding transfers the entire credit once and resets the customer's session.

```go
type Money int
price, credit := Money(125), Money(200)
fmt.Println(credit-price) // integer minor units
```

Inventory and balance form a useful conservation model: inserted money equals consumed price plus refunded change plus remaining credit. A lookup failure must not swallow the customer's credit. Separate product records prevent one purchase from modifying another item's stock. Distinguish a missing code from a known sold-out product using errors.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `ChangeDue(price,paid int) (int,error)` accepts nonnegative values and sufficient paid amount, returning paid-price. Any negative or insufficient value errors.

Final: `NewVendingMachine([]Product) (*VendingMachine,error)` validates unique nonempty codes, positive prices and nonnegative stock, and copies input. Empty inventory valid. `Insert(amount) (int,error)` requires positive amount and returns accumulated credit. `Balance() int` reads credit. `Select(code) (*Sale,error)` errors for unknown code, sold-out product, or insufficient credit without any change. Success returns code and change, decrements its stock once and clears credit. `Refund() int` returns and clears credit; repeated refund zero. `Inventory() map[string]Stock` returns a fresh map of value structs.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
