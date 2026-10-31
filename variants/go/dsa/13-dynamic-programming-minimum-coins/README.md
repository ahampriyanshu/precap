# Dynamic programming: minimum coins

A locally largest coin may block an optimum: with 1,3,4, total 6 uses two 3s instead of 4,1,1. The subproblem asks for the minimum count for each exact smaller amount, and impossible states must stay distinct from zero coins.

```go
const impossible = -1
answers := []int{0, impossible, impossible}
fmt.Println(answers[0], answers[2])
```

A dependency only points toward a smaller amount when all sizes are positive; zero or negative sizes break progress. Dynamic programming removes repeated exploration, trading amount-sized memory for polynomial work. This is pseudo-polynomial in the numeric amount, so huge integer amounts remain expensive. Greedy correctness needs additional denomination properties.

## Practice

Implement `Prototype(sizes []int,amount int) (int,error)` by recursive choices without caching; `Solve` reuses smaller amounts in O(amount*len(sizes)) time and O(amount) space. Unlimited positive sizes; return minimum count for exact total, -1 if impossible. Zero amount returns zero, including empty sizes. Negative amount or nonpositive size returns error before search. Preserve input.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
