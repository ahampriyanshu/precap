# Errors, defer, and resource ownership

An error is an ordinary interface value returned alongside useful results. Check it before using a result whose contract depends on success. A sentinel error represents a stable category; a custom error type can carry structured fields. Wrap with fmt.Errorf and `%w` when adding context while preserving classification. errors.Is follows wrapping to test a category, and errors.As extracts a matching structured error. Comparing text is brittle because messages are for people and can change.

```go
base := errors.New("unavailable")
wrapped := fmt.Errorf("read configuration: %w", base)
fmt.Println(errors.Is(wrapped, base)) // true
```

## Defer binds cleanup to scope

A deferred call runs when the surrounding function returns or unwinds through a panic. Deferred calls execute in last-in, first-out order. Its function and argument values are evaluated at the defer statement, while a deferred closure reads captured variables when invoked. Register cleanup immediately after successful acquisition so later early returns cannot skip it. Do not defer a close inside a large long-running loop if it must release each resource before the next iteration; extract a per-iteration function or close explicitly.

Resource ownership must be stated. A function may borrow a reader and leave closing to its caller, or consume an owned resource and close it exactly once. It should not silently mix the two. When both work and cleanup fail, choose an error policy: preserve the primary work failure, return the cleanup failure only if work succeeded, or combine errors when the caller benefits from both. The exercise uses primary-error precedence and tests it explicitly.

## Panic is not ordinary validation

Use errors for expected input, I/O and capacity failures. Panic indicates a violated assumption or exceptional failure; recover is generally placed at a deliberate boundary that can restore a meaningful state. A recover in another goroutine cannot catch this goroutine's panic. Deferred cleanup is still necessary even when a panic propagates. This lesson's implementation must not swallow a panic from its source.

A returned byte slice may alias a reusable buffer owned by the source. Closing or reading that source again can mutate the buffer, so detach the bytes before exposing them to a caller when the API promises ownership. Copying only the slice descriptor is insufficient. On failure, partial bytes are discarded here; streaming APIs sometimes intentionally return data plus an error and require a different contract.

These rules apply to files, response bodies, transactions and temporary resources. Successful-path tests alone miss leaked resources and overwritten primary errors; explicitly test every exit path, including panic unwinding.

## Practice

Implement `Prototype(source OwnedSource) ([]byte,error)` with explicit cleanup on ordinary exits; then `Solve` using defer so cleanup also runs during a source panic. OwnedSource has `ReadAll() ([]byte,error)` and `Close() error`. Nil interface returns error without calls. For a nonnil source, ReadAll runs exactly once, Close exactly once after it (including read error). If reading fails, return nil and that classifiable read error even if Close also fails. If only Close fails, return nil and its error. Complete success returns a detached nonnil byte slice, including empty input. Final must close on a ReadAll panic, then let that panic propagate. Typed nil receivers are outside the input domain. Do not return a source-owned buffer.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
