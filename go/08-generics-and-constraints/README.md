# Generics and constraints

Generics parameterize an algorithm over types while keeping static checking. A type parameter has a constraint describing the permitted types and operations. `any` permits values but supplies almost no operations beyond storing and passing them. `comparable` permits equality and map keys. An interface type set such as `~int | ~int64` includes named types with those underlying representations; without the tilde it names only the listed types themselves.

```go
type Count int
type Integer interface { ~int | ~int64 }
func Twice[T Integer](value T) T { return value + value }
// Twice(Count(3)) has type Count, preserving the domain type.
```

## Constraints are contracts for operations

A generic body is checked against the constraint, not against whatever type happens to be used at one call site. You cannot add two arbitrary values constrained only by any. Choose the narrowest operation set that expresses the algorithm instead of creating a large universal constraint. Type inference often deduces parameters from arguments, while an empty or nil input may require an explicit type argument.

An instantiated generic function still has an ordinary static function signature. Type parameters belong to functions or types; methods cannot independently declare a new set of method-specific type parameters in the syntax many other languages permit. Generic containers can put parameters on their receiver type, and free generic functions can express conversions.

## Equality is not domain equivalence

Comparable includes structs and arrays when every component is comparable, pointers by identity, and floating-point values. It does not make `[]int` a valid map key. Floating-point NaN is unequal to itself, so a unique operation defined by `==` will retain each NaN occurrence. An interface-typed key can still panic if its dynamic value is not comparable; this exercise restricts inputs to concrete comparable values with safe equality. For text, exact string equality is different from case-insensitive or normalized equivalence.

Generics remove duplicated representation-specific code, but do not remove ownership rules. Returning the input slice as a unique result can expose shared storage even if no duplicate existed. Construct an owned output, preserve first-occurrence order, and avoid relying on map traversal order. A map supports expected constant-time membership without determining the output sequence.

Use generic helpers for stable, repeated algorithms over types. A small concrete function may remain clearer for one domain, and interfaces suit behavior polymorphism where callers provide capabilities rather than a type-level operation set. The exercise checks named types, arrays, structs and pointer identity so a solution cannot accidentally convert everything to strings or integers.

## Practice

Implement `Prototype[T comparable](values []T) []T` by scanning earlier retained values (O(n²)); `Solve[T comparable]` uses a membership map for expected O(n). Return the first occurrence of each distinct value in original order, comparing by Go `==`. Inputs are concrete comparable values with safe equality; no interface values containing uncomparable dynamic data. Return a detached nonnil empty slice for nil/empty input. Preserve original storage; do not sort or coerce types. Named types and pointer identity must be preserved. Extra memory O(number of unique values).

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
