# Strings and frequency maps

A map records multiplicity; a set only records presence. A rune is a Unicode code point, while indexing a string gives a byte. Case folding can expand one code point into several, so normalization must precede counting. Canonical normalization and grapheme segmentation are separate choices.

```go
counts := map[rune]int{}
counts['é']++
fmt.Println(counts['é'], counts['x']) // 1 0
```

Map lookup for a missing key returns the element type's zero value. This suits counters, but cannot distinguish missing from a stored zero unless you use the comma-ok form. Count both texts once for expected O(L) counting work and O(u) distinct-symbol memory; rescanning for each distinct rune costs O(uL). Missing extra copies matter in inventory reconciliation and anagram checks. Counts lose sequence information and cannot answer contiguous substring queries.

## Practice

Implement `Prototype(loaded, requested string) map[rune]int` by rescanning and `Solve` with frequency maps. Apply provided `FoldAlphabetic` to each complete string, then return only positive requested-minus-loaded counts. Empty inputs are valid. Rune keys replace single-code-point string keys. Go maps have no iteration order: consumers must sort keys for display; map order is not part of this variant's API. No further normalization. The helper supplies Unicode full case folding and alphabetic filtering so `ß` matches `SS`; it is not the counting solution.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
