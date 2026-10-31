# Heaps and k-way merge

Only the smallest unconsumed value from each sorted feed can be the next global value. Emitting it exposes one replacement from that same feed. Heap entries therefore carry value, feed index, and offset.

```go
type Cursor struct { Value, Feed, Offset int }
frontier := Cursor{Value: 7, Feed: 2, Offset: 0}
fmt.Println(frontier.Feed)
```

A heap is a partial order: the root is minimal; siblings need not be sorted. Go's container/heap expects a type implementing Len, Less, Swap, Push, and Pop. Be careful that Pop removes the last element after heap repair. Merging sorted logs or runs avoids sorting all N values again. Empty feeds still cost inspection time.

## Practice

Implement `Prototype(feeds [][]int) []int` by concatenating and sorting; `Solve` uses a min-heap with one candidate per active feed. Each feed is already nondecreasing. Preserve duplicates and all caller-owned inner slices. Empty feeds are valid. Include O(k) feed inspection and O(N log(k+1)) emission work, with O(k) heap space excluding output.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
