# Expense Sharing System

Money uses integer cents, and every expense preserves a zero-sum balance vector. Equal division allocates the remainder deterministically by sorted member name. Floating-point rounding is unnecessary and would make cent conservation harder to guarantee.

```go
total, count := 10, 3
base, remainder := total/count, total%count
fmt.Println(base, remainder) // 3 cents each, one extra cent to allocate
```

Idempotency spans both expense and settlement methods. Canonical expense identity ignores participant order but preserves membership, payer and total. Retry recognition occurs before current-balance checks so a completed settlement remains safely retryable. Settlement suggestions operate on copies and use a deterministic greedy pairing; they do not claim a globally minimal transfer count.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `SplitEqual(total int,participants []string) (map[string]int,error)` requires total>=0 and nonempty distinct nonempty names; divide equally, first total%count lexicographically sorted names get one extra cent. Return every share including zero, preserve input; Go map iteration unordered.

Final: `NewExpenseSharing(members []string) (*ExpenseSharing,error)` copies fixed nonempty distinct nonempty group, balances zero. `AddExpense(op,payer string,total int,participants []string) (bool,error)` requires nonempty op, positive total, known payer and nonempty distinct known participants; payer may be absent. Credit total to payer, debit exact equal shares; new success true. `Settle(op,debtor,creditor string,amount int) (bool,error)` structurally requires nonempty op, distinct known members and positive amount; new success requires debtor balance<=-amount and creditor>=amount, then increases debtor/decreases creditor. Both methods validate structure first, recognize exact successful retry next (false unchanged), then perform balance checks. Expense identity ignores participant order. Any accepted op reused with changed data or other method errors; failed requests do not consume op. `Balances() map[string]int` fresh all members including zeros; positive owed, negative owes, sum zero. `SuggestSettlements() []Settlement` copies balances, sorts debtor/creditor names separately, pairs first remaining for smaller amount, advances exhausted sides, no zero transfers, no mutation. All integers fit int.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
