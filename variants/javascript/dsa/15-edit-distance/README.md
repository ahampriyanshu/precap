# Edit distance

Levenshtein distance is the fewest unit-cost insertions, deletions and substitutions needed to transform one string into another. Exact matching is one endpoint of approximate text comparison. Transposing adjacent characters is not an allowed single edit, so ab to ba needs two edits.

A recursive prototype compares prefixes and branches over their possible final edits. Repeated prefix pairs appear many times; dynamic programming stores each answer once.

## State and reasoning

For prefix lengths i and j, deletion uses the previous row's same column, insertion uses the current row's previous column, and alignment uses the previous diagonal plus zero or one depending on equality. Empty-prefix boundaries encode inserting or deleting every code point.

A distance-only result needs only the previous row. Updating one row in place also works if the old diagonal is saved before overwriting a cell. Put the shorter string on the column axis to bound DP row storage by O(min(n,m)). Converting both inputs to complete code-point arrays adds O(n+m) representation storage, so distinguish that from recurrence state; iterating the longer input avoids its copy.

Compare Unicode code points, not UTF-16 code units or visible graphemes. A supplementary symbol is one edit unit. A composed accent and its combining sequence may have different distance because canonical normalization is deliberately absent.

```javascript
const supplementary = Array.from("😀");
const combining = Array.from("é");
console.log(supplementary.length, combining.length); // 1 2
const emptyToPrefix = [0, 1, 2, 3];
console.log(emptyToPrefix[3]); // 3 insertions from empty to a three-point prefix
```

## Cost and use

The uncached prototype can be exponential. Final DP costs O(nm) time and O(min(n,m)) row state. Retaining a full table is useful when reconstructing an edit script but unnecessary for distance alone. This is a precise unit-cost model; weighted edits or transposition-aware spelling distance require altered recurrences.

## Practice

Implement `prototype(left, right)` and `solve(left, right)`. Return unit-cost Levenshtein distance over exact Unicode code points. Allowed edits are insertion, deletion and substitution; do not fold or normalize, and do not count transposition as one edit.

`"kitten", "sitting"` returns 3; `"ab", "ba"` returns 2; `"", "abc"` returns 3. Prototype: recursive prefix comparison without caching. Final: O(nm) DP and O(min(n,m)) auxiliary space for distance only; iterate the longer string to avoid an additional full input copy. Preserve strings; no additional validation errors.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.

String positions and lexicographic ordering in this exercise use Unicode code points. `Array.from(text)` and string iteration expose code points; `text.length`, indexing, and default string sorting use UTF-16 code units. Do not substitute locale collation or add Unicode normalization.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
