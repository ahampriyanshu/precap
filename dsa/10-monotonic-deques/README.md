# Monotonic deques

A deque is a double-ended queue: values can be added or removed efficiently at either end. A **monotonic deque** additionally maintains an ordering invariant. For sliding-window maxima, it stores candidate indices whose values decrease from front to back. The front is the current maximum.

Why another structure when a running sum needs only one number? A sum can subtract the value that leaves. A maximum cannot: if the old maximum expires, you need to know which remaining value replaces it. Scanning each window again works, but costs O(nw) for `n` values and width `w`.

A direct rolling maximum is concise and gives a useful small-input reference:

```python
values, width = [3, 1, 4, 2], 3
maxima = []
for right in range(width, len(values) + 1):
    window = values[right - width:right]
    maxima.append(max(window))
print(maxima)
```

It prints `[4, 4]`; each slice and `max` touches the window again.

## Remove expired and dominated candidates

Trace `[3, 1, 4, 2]` with width `3`. Write candidates as `index:value`:

- Read index `0`: deque `[0:3]`.
- Read index `1`: deque `[0:3, 1:1]`.
- Read index `2`: value `4` dominates both older candidates. Remove them from the back and append `2:4`. The first full window has maximum `4`.
- Read index `3`: append `3:2`, giving `[2:4, 3:2]`. The next window also has maximum `4`.

An older value no larger than a newly arriving value is permanently unnecessary: the newer value is at least as large and expires later. This is a dominance argument. By contrast, an older larger value stays until it leaves the window or is dominated later. Remove expired indices from the front according to position, even if their values remain large.

Indices matter because equal values can have different expiration times. You may retain equal candidates or discard the older equal candidate, provided your inequality and expiry rules agree. A deque of values alone makes duplicate expiration harder to reason about.

Here newer equal values dominate older ones, so candidate values are strictly decreasing:

```python
from collections import deque
values, width = [3, 1, 4, 2], 3
candidates, maxima = deque(), []
for index, value in enumerate(values):
    while candidates and candidates[0] <= index - width:
        candidates.popleft()
    while candidates and values[candidates[-1]] <= value:
        candidates.pop()
    candidates.append(index)
    if index >= width - 1:
        maxima.append(values[candidates[0]])
print(maxima)
```

The same `[4, 4]` result comes from candidate maintenance. Expiry uses indices; dominance uses values.

The inner removal loops do not make the method quadratic. Each index is appended once and removed at most once, from either end. Total deque work is O(n), with O(w) auxiliary space and output of size `max(0, n-w+1)`. In Python, use `collections.deque`; removing index zero from a list shifts its remaining contents.

Use monotonic deques for rolling peaks and troughs, including time-series monitoring and streaming statistics with fixed-width windows. They do not maintain medians, arbitrary ranks, or arbitrary range queries. A heap can maintain maxima with careful expiry but introduces logarithmic operations and possibly stale entries. For small windows, rescanning is simpler and may be entirely adequate. A sparse table or segment tree better fits ranges whose boundaries do not advance together.

## Practice

Implement `prototype(loads: list[int], width: int) -> list[int]` and `solve` with the same signature. Return the maximum of each full contiguous window in starting-index order. Integers may be negative. Empty input or `width > len(loads)` returns `[]`. Raise `ValueError` for `width <= 0`, even with empty input.

Examples: `([9, 8, 7, 6], 2)` returns `[9, 8, 7]`; `([4, 4, 1, 4], 2)` returns `[4, 4, 4]`.

Prototype: scan each window. Final: maintain candidate indices in a monotonic deque, targeting O(n) time and O(width) auxiliary space. Preserve inputs, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
