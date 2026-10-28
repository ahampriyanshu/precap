# Edit distance

Levenshtein edit distance is the minimum number of single-character insertions, deletions, and substitutions needed to transform one string into another. Each operation costs one in this lesson. Matching a character costs zero. This gives a basic model for typo similarity, sequence comparison, and approximate lookup.

It is a distance under specified operations, not a measure of meaning. Two words may be semantically related but far apart by edits. Swapping adjacent characters is not one Levenshtein operation. Case folding and Unicode normalization would change the inputs and therefore the question being answered.

## Give each table cell a precise meaning

Let `D[i][j]` mean the distance from the first `i` characters of the left string to the first `j` of the right string. Empty-prefix boundaries are `D[i][0]=i` and `D[0][j]=j`.

The first cell for `a` versus `a` shows all three predecessor meanings:

```python
previous = [0, 1, 2, 3]  # Empty left prefix versus prefixes of "acb".
current = [1]            # Delete "a" to reach the empty right prefix.
j, left_char, right_char = 1, "a", "a"
current.append(min(previous[j] + 1, current[j - 1] + 1,
                   previous[j - 1] + (left_char != right_char)))
print(current)
```

It prints `[1, 0]`: the diagonal match costs zero, beating deletion and insertion.

For `'ab'` and `'acb'`:

| Left prefix / right prefix | empty | a | ac | acb |
|---|---:|---:|---:|---:|
| empty | 0 | 1 | 2 | 3 |
| a | 1 | 0 | 1 | 2 |
| ab | 2 | 1 | 1 | 1 |

The last cell is `1`, corresponding to inserting `c`. For `i > 0` and `j > 0`, take the minimum of these three candidates:

- Deletion: `D[i-1][j] + 1`, removing the final left character.
- Insertion: `D[i][j-1] + 1`, adding the final right character.
- Substitution or match: `D[i-1][j-1] + cost`, where `cost = 0` if `left[i-1] == right[j-1]`, otherwise `1`.

Each option handles a possible final step; taking their minimum covers the optimal final step as well.

These dependencies explain the traversal order. To calculate one row you need the previous row and the current row's previous cell. You do not need the entire matrix when returning only the distance. Retaining two rows gives O(min(n,m)) auxiliary space if the shorter string indexes columns; time remains O(nm).

For this fixed pair, overwrite the previous row only after finishing every column:

```python
left, right = "acb", "ab"  # Put the shorter string in columns.
previous = list(range(len(right) + 1))
for i, left_char in enumerate(left, 1):
    current = [i]
    for j, right_char in enumerate(right, 1):
        current.append(min(previous[j] + 1, current[j - 1] + 1,
                           previous[j - 1] + (left_char != right_char)))
    previous = current
print(previous[-1])
```

The output is `1`. Swapping the strings preserves the unit-cost distance and keeps only three columns here; overwriting `previous` mid-row would corrupt dependencies.

A recursive prototype branches on those final edits without caching. Many branches ask for the same prefix pair, causing exponential growth. Dynamic programming stores only the `(n+1)(m+1)` distinct states. The small table also helps catch off-by-one errors: a row index is a prefix length, not the index of its final character.

Use this method for modest strings and the specified unit edit model. Full tables become expensive for very long texts; thresholded or banded methods may help when only small distances matter. Producing a human-readable diff requires recovering an edit path and choosing among ties, which this API does not request. For visual text, code points may differ from user-perceived characters, so choose a segmentation policy before applying the recurrence.

## Practice

Implement `prototype(left: str, right: str) -> int` and `solve` with the same signature. Return unit-cost Levenshtein distance over exact Python string code points. Allowed edits are insertion, deletion, and substitution. Do not casefold or normalize Unicode; transposition is not a single edit.

Examples: `('kitten', 'sitting')` returns `3`; `('ab', 'ba')` returns `2`; `('', 'abc')` returns `3`.

Prototype: recursive prefix comparisons without caching. Final: use dynamic programming with O(nm) time and O(min(n,m)) auxiliary space for a distance-only result. Strings remain unchanged; no additional validation errors are required.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
