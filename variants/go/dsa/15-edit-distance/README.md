# Edit distance

Edit distance compares two prefixes. The last edit is an insertion, deletion, or substitution; matching final code points adds no cost. Base rows represent converting an empty prefix into a nonempty one.

```go
word := []rune("café")
fmt.Println(len(word)) // code points, not UTF-8 bytes
```

Each row depends only on the previous row and its own previous cell. Retain the shorter dimension for the DP buffer, while accounting separately for rune-decoding storage. The number measures edit cost, not a sequence of edits. Reconstruction needs retained decisions or a divide-and-conquer method. Autocorrection and data reconciliation use this model, but linguistic similarity may need weighted edits.

## Practice

Implement `Prototype(left,right string) int` with uncached recursive prefix comparisons; `Solve` uses Levenshtein DP in O(nm) time and O(min(n,m)) auxiliary space after rune decoding. Unit insertion/deletion/substitution, exact code points; transposition costs two edits. No folding/normalization. Empty string distance equals the other's rune length. Rune conversion itself uses O(n+m) storage in Go.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
