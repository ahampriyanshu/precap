# KMP string search

A failed comparison can reuse a matched prefix that is also a suffix. KMP's prefix table records the longest proper border at every pattern position; fallback decreases the matched length without rewinding the text cursor. Retaining a border after a complete match preserves overlaps.

```go
symbols := []rune("éaé")
fmt.Println(len(symbols), len("éaé")) // 3 runes, 5 bytes
```

Code-point indexing requires rune decoding. It does not count visible grapheme clusters. The border invariant makes repetitive inputs linear because fallback spends previously earned progress. Resetting to zero after each mismatch repeats work; resetting after a match loses overlaps. KMP suits streaming exact matching and repetitive data; wildcard and approximate matching require different state.

## Practice

Implement `Prototype(text, pattern string) []int` by trying each rune start; `Solve` must use KMP O(n+m) time and O(m) auxiliary space. Return all ascending rune indices, including overlaps. Empty pattern matches all rune boundaries, including the end. Exact code-point equality; preserve text without folding or normalization. Unlike Go's byte-index string search APIs, this contract deliberately uses rune positions.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
