# Segment trees

A segment tree stores a summary for each of recursively divided intervals. A parent combines its two children's summaries; leaves represent individual values. This supports point changes and range queries without rescanning the entire range.

The combine operation must be **associative**: grouping should not change the result. For minima, `min(min(a,b),c)` equals `min(a,min(b,c))`. Sum, maximum, and greatest common divisor also work with suitable identities. Commutativity is not required in general; for order-sensitive summaries, combine selected intervals in the correct order.

## Repair only the ancestors that depend on a value

For `[4,1,7,3]`, leaves store the values. Their parents store minima `1` for `[0,2)` and `3` for `[2,4)`. The root stores `1` for `[0,4)`.

An iterative layout keeps index zero unused and places four leaves at positions `4..7`:

```python
values = [4, 1, 7, 3]
base = len(values)
tree = [float("inf")] * base + values.copy()
for node in range(base - 1, 0, -1):
    tree[node] = min(tree[2 * node], tree[2 * node + 1])
print(tree[1], tree[2], tree[3])
```

It prints `1 1 3`: the whole-array minimum and the minima of its two halves.

Replace public index `1` with `6`:

1. Its leaf changes from `1` to `6`.
2. Recompute the parent: `min(4,6)=4`.
3. Recompute the root: `min(4,3)=3`.

Other nodes remain valid because their intervals do not contain the changed position. A balanced division has O(log n) ancestors, so the replacement costs logarithmic time.

Starting from that valid layout, repair only the path from the changed leaf to the root:

```python
# Slot zero is unused; leaves at 4..7 contain [4, 1, 7, 3].
tree, base = [float("inf"), 1, 1, 3, 4, 1, 7, 3], 4
node = base + 1
tree[node] = 6
while node > 1:
    node //= 2
    tree[node] = min(tree[2 * node], tree[2 * node + 1])
print(tree[1], tree[2], tree[3])
```

The output is `3 4 3`. The right-half summary stays `3`, while its unchanged value still participates in the repaired root.

To query `[1,4)`, combine the leaf for index `1` with the stored summary for `[2,4)`, giving `min(6,3)=3`. A query uses a small collection of fully covered intervals rather than visiting every contained leaf. At each level, only boundary intervals require further splitting.

The direct baseline copies the values, replaces one value in O(1), and scans each requested range in O(n) worst-case time. A segment tree costs O(n) construction and space, then O(log(n+1)) time for each point replacement or range query. Returned answers require additional output space. Lazy propagation, which supports whole-range updates, is an extension and is not needed here.

Why not subtract prefix minima? If prefix `[4,1]` has minimum `1` and a larger prefix also has minimum `1`, those two numbers reveal nothing about the remaining suffix minimum. Minimum has no inverse that removes an earlier contribution. Increasing an old minimum also requires finding its replacement, as the example demonstrates.

Use a Fenwick tree when point additions and sum queries are sufficient and a smaller implementation is helpful. Use static range-query preprocessing when values never change. For a few short queries, a scan is simpler. Empty intervals need an internal identity such as positive infinity, while this API returns `None`; do not leak internal sentinels or confuse a real zero with absence.

## Practice

Implement `prototype(temps: list[int], commands: list[tuple[str, int, int]]) -> list[int | None]` and `solve` with the same signature. Initialize internal values from `temps`. `('set', index, value)` replaces a value; `('min', left, right)` queries `[left,right)`. Return only query results in command order, using `None` for empty ranges. Negative integers are valid.

Example: `([1,5], [('min',0,2), ('set',0,9), ('min',0,2), ('min',1,1)])` returns `[1,5,None]`.

Raise `ValueError` for unknown operations, set indices outside `0 <= index < n`, or ranges failing `0 <= left <= right <= n`. Prototype: copy and scan. Final: build a segment tree with O(n) construction/space and logarithmic updates/queries. Preserve both inputs, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
