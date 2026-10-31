# Packages, tooling, and testing

A package is Go's compilation and visibility boundary. Files in one directory normally declare the same package; uppercase names are exported to importers, lowercase names remain internal. A module describes a dependency unit and language version in go.mod. The installed compiler and the module's declared language version are related but distinct: a recent compiler can build older-language source under that module's rules. Keep dependency boundaries small and avoid cyclic imports.

```go
package settings

type Settings struct { Workers int } // exported value
func validWorkers(n int) bool { return n > 0 } // package-private helper
```

## Tooling is part of maintainability

Use gofmt for canonical formatting rather than debating indentation. `go test ./...` compiles and runs tests across packages; `go vet ./...` checks several suspicious patterns; `go test -race ./...` instruments supported targets to detect data races exercised by the test workload. A clean race run is evidence for those paths, not a proof that every execution is race-free. `go mod tidy` reconciles module requirements and sums; review its diff instead of treating dependency changes as incidental.

A normal test file ends in `_test.go`, imports testing, and defines `TestName(t *testing.T)`. Table-driven subtests attach readable names to independent cases. Fatal stops one test goroutine; it should not be used as a control mechanism from arbitrary worker goroutines. Separate setup per case prevents hidden dependence on iteration order. Tests should exercise observable contracts rather than private implementation details, allowing a safe refactor to preserve behavior.

## Tests describe boundaries and failure order

A parser needs normal examples, defaults, explicit zeros, unknown keys, duplicate keys, malformed syntax and numeric bounds. Checking only a happy path cannot show that an invalid request avoids partial state changes. Preserve caller storage on every exit and test it after an error. For errors, classify stable categories where available; do not require incidental English wording.

Coverage identifies unexecuted code but says little about assertion strength. A line can execute without its result being checked. Mutation of returned snapshots often reveals ownership bugs that equality tests miss. Benchmarks use the testing benchmark framework and representative input; avoid making correctness depend on a tiny timing threshold. Fuzzing can extend input diversity once a precise invariant or oracle exists.

These lessons use a self-contained main.go executable harness so two explicit files can run without generating a module or test directory. It provides named checks, panic recovery and nonzero exits. In an application repository, extract the same contracts into normal testing.T tests and place reusable parsing in an appropriately small package. The exercise practices a pure boundary that is easy to test and later move across packages.

## Practice

Implement `Prototype(lines []string) (Settings,error)` as direct parsing then validation; `Solve` should separate parsing and domain validation into small private helpers. Defaults Workers=1,TimeoutMS=1000. Each line must be exactly `workers=<decimal>` or `timeout_ms=<decimal>`; no spaces, empty lines, extra `=`, unknown keys or duplicate keys. Numeric spelling is optional leading minus followed by one or more ASCII digits (no plus); leading zeros allowed. Workers must be 1..64; TimeoutMS 0..60000. Invalid syntax/domain returns nonnil error and zero Settings. No retained state, no partial defaults returned on error. Preserve lines. Empty input returns defaults. The exact public functions stay in package main for the executable harness; private helpers remain unexported.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
