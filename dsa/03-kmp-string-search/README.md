# KMP string search

Exact substring search finds a pattern inside longer text. Trying every starting position can repeat nearly identical comparisons, costing O(nm) in the worst case for lengths `n` and `m`. Knuth–Morris–Pratt (KMP) reuses partial matches to give a linear bound, especially useful in streams and repetitive text. Prefer built-in search in ordinary Python; this lesson exposes the reuse mechanism.

## A prefix can also be a suffix

A **proper prefix** starts at the beginning and is shorter than the whole string. `table[i]` records the length of the longest such prefix of `pattern[:i+1]` that also ends that substring. This shared prefix and suffix is a **border**.

## Build the fallback table

Let `j` be the previous prefix's border length. A match between `pattern[i]` and `pattern[j]` extends that border; a mismatch tries the shorter border stored at `table[j-1]`. Every fallback entry is already computed.

For one pattern, the construction is:

```python
pattern = "ababac"
table = [0] * len(pattern)
j = 0
for i in range(1, len(pattern)):
    while j and pattern[i] != pattern[j]:
        j = table[j - 1]
    if pattern[i] == pattern[j]:
        j += 1
    table[i] = j
print(table)
```

This prints `[0, 0, 1, 2, 3, 0]`; at the final `c`, the `while` loop tries lengths `3`, `1`, then `0`.

For pattern `'ababac'`:

| i | Character | Candidate j before comparison | Result table[i] |
|---|---|---:|---:|
| 0 | a | No proper prefix yet | 0 |
| 1 | b | 0: b differs from a | 0 |
| 2 | a | 0: a matches a | 1 |
| 3 | b | 1: b matches b | 2 |
| 4 | a | 2: a matches a | 3 |
| 5 | c | 3, then 1, then 0: all mismatch | 0 |

At position `5`, the border `'aba'` cannot extend with `c`. Its next border has length `table[2]=1`; that candidate also expects `b`, so fall back to zero. No nonempty border remains.

## Reuse the table while searching

During search, `j` counts pattern characters matching the suffix of the text already read. Suppose pattern `'ababac'` has matched `'ababa'`, so `j=5`, and the next text character is `b`. It mismatches `pattern[5]`, or `c`. Fall back to `table[4]=3`; now the same `b` matches `pattern[3]`, and the state becomes `4`. The text character is consumed once; the already matched suffix `'aba'` was reused.

A complete match ending at text index `i` starts at `i-m+1`. After recording it, use `j = table[m-1]` to retain possible overlap. For pattern `'abab'`, that fallback length is `2`: searching `'ababab'` finds starts `0` and `2` rather than missing the second match.

This independent search kernel uses the known table for `abab`; it keeps the border after a complete match:

```python
text, pattern = "ababab", "abab"
table = [0, 0, 1, 2]
j, starts = 0, []
for i, char in enumerate(text):
    while j and char != pattern[j]:
        j = table[j - 1]
    if char == pattern[j]:
        j += 1
    if j == len(pattern):
        starts.append(i - len(pattern) + 1)
        j = table[j - 1]
print(starts)
```

The output `[0, 2]` shows that overlap is retained. This kernel assumes a nonempty pattern; deciding empty-pattern behavior belongs outside it.

Every fallback reduces `j`, spending progress gained by earlier matches; neither construction nor search repeatedly rewinds its input cursor. Construction costs O(m), search costs O(n), and auxiliary space is O(m), excluding results.

Do not reset to zero after every mismatch or every complete match: that discards useful borders and can lose overlaps or repeat work. KMP matches exact symbols; it does not handle wildcards, approximate spelling, or regular expressions. Those need different state models. Python string indices refer to code points, which need not correspond one-to-one with visible characters.

## Practice

Implement `prototype(text: str, pattern: str) -> list[int]` and `solve` with the same signature. Return every starting index in ascending order, including overlapping matches. Compare Python string code points exactly; do not casefold or normalize.

Examples: `('ababa', 'aba')` returns `[0, 2]`; `('abc', '')` returns `[0, 1, 2, 3]`. An empty pattern matches every boundary, including the end. A nonempty pattern in empty text returns `[]`.

The prototype tries each start character by character. The final version uses KMP with O(n+m) search/preprocessing time and O(m) auxiliary space, excluding output. No additional errors are required; inputs remain unchanged.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
