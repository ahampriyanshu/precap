# KMP string search

Exact substring search returns locations where a pattern matches contiguous symbols. Trying each start independently can repeat almost the same comparisons on repetitive input, costing O(nm) for text length n and pattern length m. KMP reuses matched prefixes to achieve linear preprocessing and search work.

A proper prefix is shorter than the full string. The fallback table records the longest proper prefix of each pattern prefix that is also its suffix: a border. For `ababac`, the table is `[0, 0, 1, 2, 3, 0]`.

## State and reasoning

While searching, j counts pattern code points matching the suffix of text already consumed. On mismatch, the previous border identifies a shorter candidate without rewinding the text cursor. For a matched `ababa` prefix of `ababac`, a following b falls back from length 5 to length 3; that same b can then extend the shorter match.

After a full match, keep the pattern's final border rather than resetting to zero. Pattern `abab` has border `ab`, so searching `ababab` must retain starts 0 and 2. Each fallback spends progress gained by earlier matches, which bounds total fallback work linearly.

Convert strings to code-point arrays before numeric indexing, and state that the reported positions are code-point positions. A supplementary character occupies two UTF-16 code units but one code point. Handle an empty pattern before indexing it: it matches n+1 boundaries, including the end.

```javascript
const points = Array.from("A😀B");
console.log(points.length, points[1]); // 3 😀
const borders = [0, 0, 1, 2]; // for the known pattern "abab"
console.log(borders.at(-1)); // 2: retain this border after a full match
```

## Cost and use

KMP's table takes O(m) time/space and search takes O(n), excluding output. Materializing code-point arrays additionally costs O(n+m) storage; do not claim only O(m) total JavaScript storage while retaining a full text array. A streaming text iterator can avoid that extra text copy. Use KMP for exact matching in repetitive text or streams; wildcards, approximate spelling and regular expressions need different state models.

## Practice

Implement `prototype(text, pattern)` and `solve(text, pattern)`. Return every matching start as an ascending Number index, including overlaps. Compare Unicode code points exactly; do not fold or normalize.

On `"ababa", "aba"`, return `[0, 2]`. On `"abc", ""`, return `[0, 1, 2, 3]`. Empty pattern matches every code-point boundary; nonempty pattern in empty text returns `[]`.

Prototype: compare each start character by character. Final: KMP with O(n+m) preprocessing/search and O(m) auxiliary space excluding output. A text iterator avoids materializing a full text array. Preserve inputs; no additional validation errors.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.

String positions and lexicographic ordering in this exercise use Unicode code points. `Array.from(text)` and string iteration expose code points; `text.length`, indexing, and default string sorting use UTF-16 code units. Do not substitute locale collation or add Unicode normalization.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
