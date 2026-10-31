# Banking System

An atomic transfer validates both accounts and available funds before applying either debit or credit. A successful request registry is a separate source of truth: retries return the original result even after later balances change.

```go
type TransferResult struct { SourceBalance, TargetBalance int }
original := TransferResult{SourceBalance: 70, TargetBalance: 30}
fmt.Println(original.SourceBalance)
```

Only successes consume request IDs. A failed insufficient-funds attempt can succeed after a deposit, while a successful identifier reused with different arguments is an error. The outgoing total counts transferred principal once, including across retries. Balances conserve money across internal transfers; deposits intentionally add money. Ranking must use numeric spending followed by stable account identity.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `NewBalanceAccount() *BalanceAccount`, `Balance() int`, `Deposit(amount) (int,error)` positive only; `Withdraw(amount) (bool,error)` positive only, false unchanged if insufficient.

Final: `NewBank() *Bank`. Every identifier is nonempty; invalid IDs error. `CreateAccount(id) (bool,error)` creates zero balance/spending, false if already present without resetting. `Balance(id) (*int,error)` nil unknown. `Deposit(id,amount) (*int,error)` validates positive amount before missing-account lookup. `Transfer(request,source,target string,amount int) (*TransferResult,error)` first validates positive amount/IDs. Exact successful retry returns the original balances; conflicting use errors. New missing/same-account/insufficient requests return nil unchanged and consume no ID. Success moves funds, increments source outgoing total, records result. `TopSpenders(limit) ([]Spending,error)` includes zero spenders, sorts total descending then ID ascending; zero empty, negative error.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
