# Sorting and two pointers

Two pointers keep track of two positions while exploiting an ordering rule. For a pair-sum problem on sorted values, start at the smallest and largest values. Their sum tells you which endpoint cannot help and can be discarded. This removes a row or column of possible pairs at each step.

You need two distinct positions, even when their values are equal. A single `5` cannot form a pair summing to `10`, but two copies can. The required answer here is a pair of **values**, not their original indices; sorting a copy is therefore convenient.

Enumerating index pairs gives a small correctness baseline with no self-pairing:

```python
values, target = [-2, 1, 4, 7, 10], 8
pairs = []
for i in range(len(values)):
    for j in range(i + 1, len(values)):
        if values[i] + values[j] == target:
            pairs.append(tuple(sorted((values[i], values[j]))))
print(sorted(pairs))
```

It prints `[(-2, 10), (1, 7)]`; this example lists all candidates to expose the tie choice.

## Why moving a pointer is safe

For sorted values `[-2, 1, 4, 7, 10]` and target `8`:

1. The extremes sum to `-2 + 10 = 8`. This is a valid pair.
2. If the target instead were `9`, that sum would be too small. With `-2` fixed, every smaller right endpoint gives an even smaller sum, so discard `-2`.
3. Now `1 + 10 = 11` is too large. With `10` fixed, every larger left endpoint is at least as bad, so discard `10`.
4. The remaining extremes give `1 + 7 = 8`, still too small for `9`; move left again. Finally `4 + 7 = 11` is too large. No pair remains.

The pointer movements are justified by inequalities, not by guessing the next candidate.

On the same values, the first match from the sorted extremes has the smallest possible first value:

```python
ordered, target = sorted([-2, 1, 4, 7, 10]), 8
left, right = 0, len(ordered) - 1
while left < right:
    total = ordered[left] + ordered[right]
    if total == target:
        print(ordered[left], ordered[right])
        break
    if total < target:
        left += 1
    else:
        right -= 1
```

This prints `-2 10`. Changing the target to `9` exhausts the interval without printing, following the failed-search trace above. On a match, the first valid smaller endpoint encountered is the smallest possible one. For a fixed target its partner is determined, which gives the lexicographically smallest value pair. Lexicographic order compares first elements first, then second elements when the first tie.

The direct baseline checks every pair of indices, costing O(n²) time and O(1) working state if it retains only the best answer. Sorting costs O(n log n), and the inward scan costs O(n), because each pointer moves at most `n` times. A copied sorted list costs O(n) space and preserves caller order.

This pattern appears in pair selection, merging sorted sequences, and comparisons across ordered data. If you only need any matching pair in unsorted data, a hash set can give expected O(n) time at O(n) space. If original positions matter, carry indices through sorting or use an index map carefully. If data is already sorted, the scan alone is linear. Do not sort in place unless the API allows mutation, and do not let pointers meet: pairing a position with itself violates the problem.

## Practice

Implement `prototype(weights: list[int], target: int) -> tuple[int, int] | None` and `solve` with the same signature. Return the lexicographically smallest ascending value pair `(a, b)` with `a+b == target`, drawn from distinct input positions. Return `None` if no pair exists. Negative integers and duplicates are valid.

Examples: `([4, 1, 3, 2], 5)` returns `(1, 4)`; `([5], 10)` returns `None`; `([5, 5], 10)` returns `(5, 5)`.

Prototype: test all pairs. Final: sort a copy and use inward pointers, targeting O(n log n) time and O(n) space. Preserve the original list; no additional errors are required.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
