# Stacks and nested operations

A stack records the unresolved nested operations. The most recent load must be the first unloaded, so only the top element can match. A count map would lose this ordering information.

```go
stack := []string{"outer", "inner"}
top := stack[len(stack)-1]
stack = stack[:len(stack)-1]
fmt.Println(top)
```

Validate a token when processing reaches it. Prevalidating the entire stream changes behavior when an earlier ordering failure should stop evaluation. This resembles parsers and nested resource scopes: syntax and semantic evaluation order can both be contractual. Linear processing uses O(depth) stack space.

## Practice

Implement `Prototype(tokens []string) (bool,error)` using pair reduction and `Solve` using a stack. Each reached token must be exactly LOAD:label or UNLOAD:label, with a nonempty label and exactly one colon. Invalid reached tokens return error. Return false immediately at the first ordering violation without inspecting later tokens. Empty input is true; leftover loads make false. Preserve input.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
