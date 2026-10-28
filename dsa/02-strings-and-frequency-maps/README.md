# Strings and frequency maps

A frequency map associates each distinct value with how often it appears. A set can tell you that `a` exists; it cannot distinguish one `a` from five. Counting is useful for comparing text, checking anagrams, detecting repeated events, or determining which requested symbols are missing.

A Python dictionary is a hash table: lookup and updating a count take expected O(1) time for ordinary keys. “Expected” matters; this is not a promise that every possible lookup takes the same number of machine operations. A count is usually an integer, with a missing key interpreted as zero.

## Decide what counts as the same character

Text processing needs a normalization policy before counting. This exercise uses `casefold()` on the **whole string**, then retains characters for which `isalpha()` is true.

Inspect normalization before choosing a counting strategy:

```python
text = "Straße!"
folded = text.casefold()
letters = [char for char in folded if char.isalpha()]
print(folded)
print("".join(letters))
```

The outputs are `strasse!` and `strasse`: one input code point produced two counted letters. Case folding is meant for caseless matching and may expand one character: `'ß'.casefold()` is `'ss'`. Counting before case folding loses that behavior. This is different from canonical Unicode normalization; visually similar sequences can remain different.

For available text `'Aab!'` and requested text `'baaac'`:

1. Case folding and filtering produce `'aab'` and `'baaac'`.
2. Available counts are `{'a': 2, 'b': 1}`.
3. Requested counts are `{'b': 1, 'a': 3, 'c': 1}`.
4. Subtract available from requested: `a` lacks one, `b` lacks zero, and `c` lacks one.
5. Retain positive differences and emit keys in sorted order: `{'a': 1, 'c': 1}`.

The map holds multiplicities, while output sorting provides a separate, reproducible presentation rule. Dictionary insertion order does not automatically mean alphabetical order.

A counter implements those two counting passes. Normalization still happens before either count:

```python
from collections import Counter
available = Counter(c for c in "Aab!".casefold() if c.isalpha())
requested = Counter(c for c in "baaac".casefold() if c.isalpha())
deficit = requested - available  # Counter subtraction keeps positive counts.
missing = {char: deficit[char] for char in sorted(deficit)}
print(missing)
```

This prints `{'a': 1, 'c': 1}`. Using set difference instead would lose the missing extra `a`.

A simple baseline finds each distinct requested character and scans both strings again for its count. With `u` distinct characters and total text length `L`, this costs O(uL). Two counting passes remove the repeated scans. The final bound is O(L + u log u), including sorting output keys, with O(u) count space; measure `L` after case folding when considering expansions.

Frequency maps work when order does not matter. They cannot distinguish `'ab'` from `'ba'`, find contiguous matches, or preserve an event sequence. For a small fixed alphabet, an array of counters may use less memory. For user-facing text, explicitly decide whether you need code points, normalized characters, or grapheme clusters before choosing the keys.

## Practice

Implement `prototype(loaded: str, requested: str) -> dict[str, int]` and `solve` with the same signature. Casefold each whole input string, count only alphabetic code points, and return positive deficits `requested_count - loaded_count`. Insert returned keys in Python sorted order. Do not normalize Unicode further.

Examples: `('ab', 'aaa')` returns `{'a': 2}`; `('ß', 'SS')` returns `{}`. Empty strings are valid.

The prototype may rescan strings for each distinct requested letter. The final version should build frequency maps. Inputs remain unchanged. No additional error cases are required.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
