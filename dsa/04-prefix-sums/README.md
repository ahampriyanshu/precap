# Prefix sums

A range sum adds the values between two positions in a sequence. Scanning a range is reasonable for one query. Repeating that scan for thousands of overlapping queries adds the same values many times. A prefix-sum table pays once to make each later range sum a subtraction.

A direct query visits exactly the requested positions:

```python
values = [3, -2, 5, 4]
left, right = 1, 4
total = 0
for index in range(left, right):
    total += values[index]
print(total)
```

The result is `7`. Repeating this loop for overlapping ranges repeats the additions.

The prerequisite is a clear interval convention. A **half-open range** `[left, right)` includes `left` and excludes `right`, just like a Python slice. Its length is `right-left`; `[2, 2)` is empty. Half-open intervals let adjacent ranges meet without sharing an element.

## Store totals at boundaries

Define `prefix[i]` as the sum of values strictly before index `i`. There are `n+1` boundaries for `n` values, so the table begins with zero.

Build the boundary table once, then answer two queries without slicing:

```python
values = [3, -2, 5, 4]
prefix = [0]
for value in values:
    prefix.append(prefix[-1] + value)
print(prefix)
print(prefix[4] - prefix[1], prefix[2] - prefix[2])
```

The outputs are `[0, 3, 1, 6, 10]` and `7 0`. The extra leading zero handles both empty and start-at-zero ranges uniformly.

For `[3, -2, 5, 4]`:

| Boundary i | Included values | prefix[i] |
|---|---|---:|
| 0 | none | 0 |
| 1 | 3 | 3 |
| 2 | 3, -2 | 1 |
| 3 | 3, -2, 5 | 6 |
| 4 | 3, -2, 5, 4 | 10 |

To find the sum of `[1, 4)`, take `10 - 3 = 7`. Both prefixes include the first value, so subtraction removes it. For `[2, 2)`, subtraction yields `1 - 1 = 0` without a special scan. Negative values do not break this argument: it depends on cancellation, not on totals increasing.

For `q` queries on `n` values, independent scans cost O(nq) in the worst case. Preprocessing costs O(n) time and space, then each query costs O(1), giving O(n+q) total time. Slicing before summing can additionally allocate a temporary list; a direct range loop avoids that allocation but still performs the repeated additions.

Typical uses include time-series totals, per-day activity reports, and counting occurrences inside intervals after encoding an event as `1` or `0`. The same idea works for XOR because a prefix contribution can be undone. It does not let you subtract two prefix minima: knowing the minimum of two prefixes does not identify the minimum of their difference.

Use a scan when there are few short queries and preprocessing would cost more than it saves. Use a Fenwick or segment tree when updates and queries are interleaved; changing an early element invalidates many static prefix totals. Validate bounds explicitly, because Python slices silently accept some out-of-range indices that this API rejects.

## Practice

Implement `prototype(values: list[int], queries: list[tuple[int, int]]) -> list[int]` and `solve` with the same signature. Each query `(left, right)` requests the sum of `[left, right)`. Return integer results in query order; values may be negative. Empty ranges return zero.

Example: `([4, -2, 7], [(0, 3), (1, 3), (2, 2)])` returns `[9, 5, 0]`.

Raise `ValueError` for any range failing `0 <= left <= right <= len(values)`. Preserve both inputs, including on failure. Prototype: sum each range independently. Final: build one prefix table and target O(n+q) time, O(n) auxiliary space.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
