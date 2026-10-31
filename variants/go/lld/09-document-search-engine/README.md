# Document Search Engine

An inverted index maps a token to documents; a positional index also records token offsets. Positions let phrase matching check adjacency and overlapping starts. Matching whole tokens avoids false hits such as finding art inside cart.

```go
positions := []int{0, 1, 2}
fmt.Println(positions[1]-positions[0] == 1) // adjacent token positions
```

Replacing a document must remove all old frequencies and positions before adding its new content. Deleting an ID and later reusing it must not revive stale postings. Keep the original text separately from normalized tokens. Search ranking combines numeric score descending with ID ascending; map iteration cannot supply that order. Statistics include empty documents even though they have no postings.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `Tokenize(text string) []string` lowercases Unicode text then returns ordered ASCII [a-z0-9]+ runs, duplicates retained. No broader letter matching.

Final: `NewSearchEngine() *SearchEngine`; `Add(id,text) (bool,error)`, `Get(id) (*string,error)`, `Update(id,text) (bool,error)`, `Delete(id) (bool,error)` require nonempty IDs. Duplicate Add preserves original; missing Update/Delete false; deleted IDs reusable. `Search(term string,limit int) ([]Hit,error)` requires exactly one query token even at zero limit, scores occurrences. `SearchPhrase(phrase,limit) ([]Hit,error)` counts consecutive-token starts including overlaps; empty token sequence yields empty. Negative limit errors; zero returns empty after query validation. Sort score descending then ID ascending, truncate limit. `Stats() SearchStats` reports current document and token counts. Every update/delete must remove stale terms/positions/counts. Final design should retain a positional inverted index. Limits are explicit arguments; pass 10 for the customary default.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
