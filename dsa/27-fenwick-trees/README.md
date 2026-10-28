# Fenwick trees

A Fenwick tree, or binary indexed tree, maintains cumulative sums while individual values change. Static prefix sums make range queries cheap but an update near the start invalidates many entries. A plain list makes a point update cheap but each long range query expensive. Fenwick trees balance both operations at O(log n).

Typical uses include mutable frequency tables, activity totals, and counting earlier values after mapping them to ordered integer positions. The structure is compact: an array of aggregated blocks rather than explicit pointer nodes.

## Binary indices define the blocks

Use one-based internal indices even if the public API is zero-based. Define `lowbit(i) = i & -i`, the value of the least significant set bit. Cell `i` summarizes the last `lowbit(i)` values ending at internal position `i`.

Inspect the covered positions before writing either traversal:

```python
values = [2, 1, 4, 3, 5, 2]
for index in [2, 4, 6]:
    lowbit = index & -index
    left = index - lowbit
    block_total = sum(values[left:index])
    print(index, (left, index), block_total)
```

The rows are `2 (0, 2) 3`, `4 (0, 4) 10`, and `6 (4, 6) 7`, using public half-open ranges to describe internal cells.

For values `[2,1,4,3,5,2]`:

| Internal cell | Covered positions | Stored sum |
|---|---|---:|
| 2 | 1..2 | 3 |
| 4 | 1..4 | 10 |
| 6 | 5..6 | 7 |

To query the first six values, read cell `6`, then subtract `lowbit(6)=2` to reach cell `4`. Read it, then move to zero. The total is `7+10=17`; the selected blocks are disjoint and cover the whole prefix.

Add `3` to public index `1`, internal position `2`. Update cells `2` and `4`, then stop beyond the array. The six-value prefix is now `7+13=20`. Updates move upward by adding `lowbit`; prefix queries move downward by subtracting it. Starting either loop at internal zero would never advance.

Start from the valid internal table for the six values, add three at public index one, then query the full prefix:

```python
# Index zero is unused; cells summarize the original [2, 1, 4, 3, 5, 2].
tree = [0, 2, 3, 4, 10, 5, 7]
index, delta = 1 + 1, 3
while index < len(tree):
    tree[index] += delta
    index += index & -index
end, total = 6, 0
while end > 0:
    total += tree[end]
    end -= end & -end
print(total)
```

The result is `20`. Update indices were `2,4`; query indices were `6,4`, so the two directions visit different block chains.

A half-open range `[l,r)` equals the prefix of length `r` minus the prefix of length `l`. Negative values and deltas are valid because sum supports cancellation. The invariant is about which interval each stored cell summarizes; neither individual values nor cumulative sums must be increasing.

A list baseline has O(1) additions and O(n) worst-case sum queries. Rebuilding static prefix sums has O(n) worst-case updates. Fenwick operations each touch O(log(n+1)) blocks and use O(n) space. Construction by repeated updates costs O(n log(n+1)); a dedicated build can be linear.

Use simple prefix sums for immutable data. Use a segment tree for arbitrary replacements and aggregates such as minimum, which cannot be recovered by subtracting prefixes. A Fenwick tree can support more variants, but range additions or order-statistic queries require additional assumptions and design. Distinguish an additive update from replacement: adding `5` does not mean setting the old value to `5`.

## Practice

Implement `prototype(values: list[int], commands: list[tuple[str, int, int]]) -> list[int]` and `solve` with the same signature. Work on internal state initialized from `values`. `('add', index, delta)` adds an integer; `('sum', left, right)` queries `[left,right)`. Return only sum results in command order. Empty ranges sum to `0`; negative values/deltas are valid.

Example: `([2,4,6], [('sum',0,3), ('add',0,-5), ('sum',0,2)])` returns `[12,1]`.

Raise `ValueError` for unknown operations, add indices outside `0 <= index < n`, or ranges failing `0 <= left <= right <= n`. Prototype: copy and scan. Final: use a Fenwick tree with logarithmic operations. Preserve both inputs, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
