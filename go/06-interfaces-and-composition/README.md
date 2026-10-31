# Interfaces and composition

An interface describes a set of methods, and a concrete type satisfies it implicitly when its method set contains them. There is no implements declaration. Define small consumer-facing interfaces for the behavior a function actually needs, rather than exposing an entire service implementation. A narrow interface makes test doubles and alternate implementations easier without requiring a common base class.

```go
type Closer interface { Close() error }
// Any concrete type with Close() error satisfies Closer.
var resource Closer
fmt.Println(resource == nil) // nil interface: no dynamic type or value
```

## Composition supplies reusable behavior

Go has no class inheritance: there is no extends relation, base-class constructor chain, or virtual method override hierarchy. A struct can contain another object explicitly and delegate selected behavior. Embedding promotes fields or methods as a convenience, but does not create inheritance or automatically make the outer type substitutable everywhere. Prefer explicit fields when they make ownership and delegation clearer.

A wrapper that scales values can implement the same reader interface while depending only on that interface. The inner reader may be a constant, an error-producing source, or another wrapper. This is composition: each layer owns one policy and forwards the rest. Preserve an underlying error rather than replacing it with a vague generic failure; callers may need errors.Is or errors.As to classify it.

## Interface nil has two pieces

An interface value carries a dynamic type and a dynamic value. A typed nil pointer stored in an interface has a dynamic type, so it is not equal to nil. Calling its method may work if that method handles a nil receiver, or panic if it dereferences one. Do not write reflection-based nil handling by default; decide whether the abstraction permits nil concrete receivers. This exercise rejects a nil interface while allowing a typed nil implementation whose method deliberately returns an error.

Type assertions expose a concrete value or a narrower capability. The comma-ok form avoids a panic for an unexpected dynamic type. Type switches can adapt at explicit boundaries, but repeatedly switching on concrete implementations often signals that the interface omits a needed behavior. Prefer calling a capability when the operation can be expressed through the interface itself.

A value with pointer-receiver methods satisfies an interface only through the appropriate pointer method set. Compile-time assertions such as `var _ ValueReader = (*ScaledReader)(nil)` can document intended satisfaction without constructing an instance. Interfaces do not imply concurrency safety or transactional reads: this exercise promises fail-fast ordering, not rollback of already-read source side effects.

## Practice

Prototype: `Prototype(readers []ValueReader) ([]int,error)` calls ReadValue in input order, returning values on complete success. Nil interface or source error returns nil and nonnil error, without calling later readers; preserve errors.Is identity. Empty input returns nonnil empty. Typed nil implementations are allowed to define their own ReadValue behavior.

Final: `Solve(readers []ValueReader) ([]int,error)` has the same aggregation contract. Also implement `(*ScaledReader).ReadValue() (int,error)` using its exported Source and Factor fields: nil Source interface errors; otherwise call once, propagate error unchanged/classifiably, or return value*Factor. Factor may be zero/negative and products fit int. Wrappers compose recursively and must satisfy ValueReader. Reading may have external side effects; fail-fast does not undo earlier reads. Do not mutate supplied reader slice or replace its elements.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
