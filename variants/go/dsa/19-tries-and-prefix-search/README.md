# Tries and prefix search

A trie indexes shared prefixes as paths. A terminal marker is independent of having children: a complete word may also prefix another word. Empty words terminate at the root.

```go
type PrefixNode struct { Terminal bool; Children map[rune]*PrefixNode }
root := &PrefixNode{Children: map[rune]*PrefixNode{}}
fmt.Println(root.Terminal)
```

A map does not provide lexicographic traversal; collect and sort child rune keys before visiting them. Stop enumeration at the requested limit instead of building every completion first. Construction costs total input length and node storage; a trie helps repeated prefix queries, while one small query may favor a direct scan.

## Practice

Implement `Prototype(words []string,prefix string,limit int) ([]string,error)` by filtering/deduplicating/sorting; `Solve` builds a rune trie, follows prefix, enumerates sorted children until limit. Return unique words in code-point lexicographic order, exact case. Empty words/prefix valid; zero limit yields empty slice; negative limit error. Preserve input. Include construction cost; UTF-8 lexicographic byte ordering agrees with rune ordering for valid text.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
