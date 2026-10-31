# Structs, methods, and pointers

A struct groups fields into a value with a concrete layout. Assignment copies its fields. Scalar fields become independent copies; pointer, map and slice fields still reach shared data after a shallow copy. Exported names begin with an uppercase letter, so a package can expose behavior while keeping representation private. Constructors are ordinary functions, conventionally named NewThing; Go does not require a special constructor syntax.

```go
type Position struct { X, Y int }
a := Position{X: 2, Y: 3}
b := a
b.X = 9
fmt.Println(a.X, b.X) // 2 9
```

## Receivers express mutation and method availability

A value receiver receives a copy. A pointer receiver can mutate the original value and avoids copying a large receiver. Keep a consistent receiver policy for a type, especially if it contains a mutex or other state that must not be copied after use. A nil pointer is a possible receiver value, but dereferencing it panics unless the method deliberately handles nil. The exercise constructors produce nonnil objects; nil receivers are outside the contract.

The compiler can take an address for a pointer method on an addressable local value, which makes calls convenient. Interface satisfaction still follows method sets: T's method set includes value-receiver methods; *T includes both value and pointer-receiver methods. A nonaddressable temporary cannot always receive the same shorthand. This distinction matters when returning an object as an interface.

## Validation and zero-value policy

A useful type states whether its zero value is ready to use. sync.Mutex is a classic zero-ready type; a type requiring a nonempty label may need a constructor. Exposing writable fields allows callers to bypass invariants. Keep internal totals private when updates must reject negative deltas, and return a small exported snapshot struct for inspection. Returning a copy of that snapshot makes read access safe without granting mutation rights.

A pointer is not evidence that data lives on a particular memory region. Escape analysis decides placement, and a local variable's address can safely escape. Choose pointer semantics for identity, mutation and cost, then measure allocations instead of assuming every `&value` implies a heap allocation.

Go has no class declarations or class inheritance. Structs and methods provide concrete stateful objects; interfaces and composition provide behavior substitution and reuse. The next lesson develops those relationships. This exercise contrasts an explicit value transformation in the prototype with a validated pointer-owned object in the final stage.

## Practice

Prototype: `AddValue(current MeterSnapshot,delta int) (MeterSnapshot,error)` requires delta>=0; returns copied snapshot with Total increased, preserving caller. Negative delta returns error and zero snapshot. Label is not validated in this prototype.

Final: `NewMeter(label string) (*Meter,error)` requires nonempty label, starts total zero. `(*Meter).Add(delta int) (int,error)` requires nonnegative delta, returns new total; errors preserve state. `Reset() int` returns previous total and resets to zero, keeping label. `Snapshot() MeterSnapshot` detached scalar value. Empty label remains invalid even though Total's zero is useful. Arithmetic fits int. Instances independent; no concurrent access required.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
