# Strings and frequency maps

A frequency map tracks how often each value occurs. A Set distinguishes presence from absence but loses multiplicity: having one `a` does not satisfy three requested `a` letters. Counting supports inventory comparison, anagram checks and missing-symbol summaries when order is irrelevant.

The prototype can identify each requested letter and repeatedly scan both normalized strings for its count. Building one count map per input avoids those repeated scans. Map lookup/update is treated as expected constant time in the usual hash-table analysis; output ordering is a separate step.

## State and reasoning

Use the supplied `normalizeLetters(text)` helper from `exercise.mjs`. It performs full case folding, including expansions, then filters to alphabetic code points. `toLowerCase()` alone is insufficient: `ß` folds to `ss`. Case folding is also different from canonical normalization, which this exercise does not apply.

For loaded `"Aab!"` and requested `"baaac"`, normalized counts are a:2/b:1 and a:3/b:1/c:1. The positive deficits are a:1/c:1. A set difference would lose the extra missing a.

The output is an object whose property insertion order is ascending Unicode code-point order. Map insertion order reflects processing order, not alphabetic order. Each result key is one alphabetic code point, so comparing `key.codePointAt(0)` supplies the required order; localeCompare and default UTF-16 sorting are different policies. Count after folding because one source code point may expand to several counted letters.

```javascript
import { normalizeLetters } from "./exercise.mjs";
const letters = normalizeLetters("Straße!");
console.log(letters.join("")); // strasse
const counts = new Map();
counts.set("a", (counts.get("a") ?? 0) + 1);
console.log(counts.get("a")); // 1
```

## Cost and use

For total normalized length L and u distinct letters, rescanning costs O(uL). Count maps plus sorted emission take expected O(L + u log u) time and O(u) map space, apart from normalized input storage. Frequency maps cannot recover order, contiguous matches or grapheme boundaries. A fixed small alphabet may fit a counter array; general Unicode text needs an explicit code-point policy.

## Practice

Implement `prototype(loaded, requested)` and `solve(loaded, requested)`. Inputs are strings, including empty strings. Use the provided `normalizeLetters` helper for both inputs, and return an object containing only positive `requestedCount - loadedCount` deficits. Insert keys in ascending Unicode code-point order. Do not normalize further.

`prototype("ab", "aaa")` returns `{a: 2}`; either stage on `"ß", "SS"` returns `{}`. For `"Aab!", "baaac"`, return `{a: 1, c: 1}` in that key order.

Prototype: rescan normalized letters for each distinct requested letter. Final: build frequency maps. Preserve input and leave the supplied helper unchanged. No additional errors are required.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.

String positions and lexicographic ordering in this exercise use Unicode code points. `Array.from(text)` and string iteration expose code points; `text.length`, indexing, and default string sorting use UTF-16 code units. Do not substitute locale collation or add Unicode normalization.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
