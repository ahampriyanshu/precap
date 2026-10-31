# Fenwick trees

A Fenwick tree stores sums of binary-sized blocks. One-based internal index i covers lowbit(i)=i&-i elements. Prefix queries subtract lowbit to move toward zero; additions add lowbit to visit containing blocks.

```go
index := 6
lowbit := index & -index
fmt.Println(lowbit) // 2
```

A range sum subtracts two prefixes because addition has an inverse. Negative deltas are valid. Starting at internal zero creates a nonadvancing loop. Static prefixes favor immutable data; a Fenwick tree balances updates and sums at O(log n).

## Practice

Implement `Prototype(values []int,commands []Command) ([]int,error)` by copying and scanning; `Solve` uses a Fenwick tree. Command `add` uses A=index, B=delta; `sum` uses A=left, B=exclusive right. Return query results only in order; empty range returns zero. Signed values valid. Unknown op, invalid update index, or range failing 0<=left<=right<=n returns error. Preserve both inputs including on error. Addition is not replacement.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
