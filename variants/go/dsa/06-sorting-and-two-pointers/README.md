# Sorting and two pointers

Sorted order lets one comparison discard a group of impossible pairs. A sum below target needs a larger left value; a sum above target needs a smaller right value. Distinct positions matter when both values are equal.

```go
original := []int{4, 1, 3}
copyForSort := append([]int(nil), original...)
sort.Ints(copyForSort)
```

A slice assignment would share the backing array and sorting it would mutate the caller. A value pair is different from an index pair; the tie rule here compares values. Sorting adds O(n log n) work but permits O(n) pointer scanning. Hash lookup can also find sums but requires additional care for this canonical pair rule.

## Practice

Implement `Prototype(weights []int, target int) *Pair` by testing all distinct positions. `Solve` sorts a copy and moves two pointers, O(n log n) time and O(n) copy space. Return the lexicographically smallest ascending value pair summing to target, or nil. Duplicates need distinct positions. Negative values are valid; arithmetic fits int. Preserve caller order.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
