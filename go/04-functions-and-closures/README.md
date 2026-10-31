# Functions, closures, and captured state

Functions are values with static signatures. They can be passed as callbacks, returned as factories, and stored in slices. A function type describes its parameters and results; a named function type can give a domain role to an otherwise identical signature. Multiple results make value-plus-error and value-plus-presence explicit. Variadic parameters gather trailing arguments into a slice, so ownership rules still matter when retaining those values.

```go
apply := func(value int, transform func(int) int) int {
    return transform(value)
}
fmt.Println(apply(3, func(x int) int { return x * 2 }))
```

## A closure captures variables

A closure refers to variables in its surrounding lexical scope. Its lifetime can outlive the call that created it; the compiler arranges safe storage. Two closures from one factory can deliberately share a variable, while separate factory calls should create independent state. Capturing a pointer or slice does not implicitly copy the referenced data. Return a defensive copy when the factory owns a snapshot of caller input.

Go passes arguments by value. Passing a pointer copies the pointer but still reaches the same object; passing a function value copies access to the same captured environment. Therefore assigning one returned counter callback to another variable creates an alias of that counter, not a second independent counter. These distinctions are useful in stateful iterators, test doubles and request-scoped accumulators.

## Loop capture depends on the language version

For modules using Go 1.22 language semantics, variables declared by a loop are created per iteration in the revised loop cases. Older language versions can reuse a loop variable and make callbacks all observe its final value. A local binding inside the body, such as `initial := starts[i]`, makes the intended capture explicit and works across the versions supported by this lesson. This matters when a repository's go.mod language version is older than its installed compiler.

A closure over mutable state is not automatically safe for concurrent use. Synchronize shared calls or keep ownership confined to one goroutine. Do not add a mutex mechanically when the contract is single-threaded; make the ownership assumption clear. Nil function values can be compared with nil but calling them panics, so callback-accepting public APIs should define whether nil is allowed.

Keep factories small enough that captured state is visible. A closure can hide dependencies as easily as an object can; using one is a choice of representation, not a guarantee of simplicity. The exercise asks for deliberate sharing within an accumulator and independence across a collection of accumulators.

## Practice

Prototype: `Prototype(start int) func(int) int` returns a stateful callback. Each call adds its delta (signed, including zero) to the current value and returns the new value. Separate calls to Prototype are independent.

Final: `NewAccumulator(start int) (add func(int) int,read func() int)` returns two closures sharing one captured total; read never changes it. `MakeAccumulators(starts []int) []func(int) int` returns one independent add closure per initial value in order, copies initial values, nonnil empty for empty input. Function aliases intentionally share the same captured accumulator. Inputs/sums fit int, calls single-threaded. Preserve starts, including later caller mutation. No package-global mutable state.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
