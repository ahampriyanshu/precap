# Sliding windows with counts

A sliding window represents one contiguous part of a sequence using two moving boundaries. Instead of rebuilding a summary for every possible range, update it when a value enters or leaves. This is useful for recent-event analysis, bounded working sets, and substring problems with restrictions on distinct symbols.

This lesson asks for the longest range containing at most `k` distinct values. A frequency map is necessary: a set alone cannot tell whether removing one occurrence also removes that value's final occurrence from the window.

A fixed-start baseline can extend a count map until the first invalid endpoint:

```python
values, k = ["a", "b", "a", "c", "b"], 2
counts = {}
for right, value in enumerate(values):
    counts[value] = counts.get(value, 0) + 1
    if len(counts) > k:
        break
print(right, counts)
```

It stops at index `3`, with three distinct keys. Restarting this scan for each possible left boundary repeats work.

## Grow, then restore validity

Take `['a', 'b', 'a', 'c', 'b']` with `k=2`. Use an inclusive right index in this trace:

| Add at right | Window after shrinking | Counts | Best length |
|---|---|---|---:|
| a | a | a:1 | 1 |
| b | a,b | a:1 b:1 | 2 |
| a | a,b,a | a:2 b:1 | 3 |
| c | a,c | a:1 c:1 | 3 |
| b | c,b | c:1 b:1 | 3 |

When `c` enters, removing the first `a` leaves another `a`. The window still contains three kinds. Remove `b` next, delete its zero count, and validity returns. Moving left only once per violation would be incorrect.

The moving-window kernel keeps positive counts and measures only restored windows:

```python
values, k = ["a", "b", "a", "c", "b"], 2
counts, left, best = {}, 0, 0
for right, value in enumerate(values):
    counts[value] = counts.get(value, 0) + 1
    while len(counts) > k:
        old = values[left]
        counts[old] -= 1
        if counts[old] == 0:
            del counts[old]
        left += 1
    best = max(best, right - left + 1)
print(best)
```

This prints `3`. Keeping a zero-count key would make `len(counts)` cease to mean the number of distinct values in the window.

Why may the discarded starting positions stay discarded? Extending the right boundary cannot reduce the number of distinct values. Any start already invalid for this right boundary stays invalid for later right boundaries. This monotonic property lets the left boundary move forward permanently. Record an answer only after restoring the invariant: the current window contains at most `k` distinct values.

Enumerating O(n²) ranges and constructing a set for each can cost O(n³). Even an incremental-count baseline for each start costs O(n²). The sliding method performs at most `n` right moves and `n` left moves, so expected time is O(n) with hash-map operations. Keeping only positive counts uses O(k+1) live map entries during expansion, bounded by the input's distinct count.

This is a maximum **length**, not a count of all valid ranges or a subsequence with gaps. Do not apply the same shrink rule to arbitrary constraints. For example, sum thresholds with negative numbers can become valid again after adding a value, breaking the monotonic argument. For a tiny input, enumerating ranges is a useful correctness baseline. For a fixed-length numeric window, a running sum may be all the state you need.

## Practice

Implement `prototype(labels: list[str], limit: int) -> int` and `solve` with the same signature. Return the greatest length of a contiguous range containing at most `limit` distinct strings. Labels use exact string equality. `[]` and `limit=0` return `0`; a negative limit raises `ValueError`.

Example: `(['a', 'a', 'b', 'c', 'b'], 2)` returns `3`.

Prototype: enumerate ranges and count distinct values. Final: maintain one window and frequency map in expected O(n) time. Do not mutate the input, including when rejecting a negative limit.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
