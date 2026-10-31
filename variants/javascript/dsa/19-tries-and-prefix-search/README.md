# Tries and prefix search

A trie indexes shared prefixes: each edge consumes one code point and each node represents the path reaching it. Exact completion queries follow the requested prefix before exploring matching suffixes. The baseline instead filters the full input, deduplicates matches and sorts them on every query.

A terminal marker distinguishes a complete word from a path that only leads to longer words. Inserting cold and colder must still remember that cold itself is a valid result.

## State and reasoning

Build the trie from code points, setting a terminal flag at each word's final node. Duplicate words reach the same terminal and add no additional result. The empty word terminates at the root, so an empty prefix can include it.

After following the query prefix, visit terminal content before descendants, and traverse child keys in ascending code-point order. That ordering emits a word before its longer extensions and yields lexicographic completion order. Stop after the output limit, but include the full trie construction cost in performance claims.

Use Map children rather than object properties when representing arbitrary code-point edges. Map insertion order alone is not the required sorted order. The supplied compareText helper compares whole strings by code points; use it to sort words or child-symbol keys. Default UTF-16 sort and localeCompare are different policies. Copy collections before sorting.

```javascript
import { compareText } from "./exercise.mjs";
const children = new Map([["😀", {}], ["", {}], ["a", {}]]);
console.log([...children.keys()].sort(compareText)); // ["a", "", "😀"]
const terminalAtRoot = true;
console.log(terminalAtRoot); // true: the empty word may be stored
```

## Cost and use

Let L be total input code points. Construction costs O(L) expected Map work and O(L) nodes, ignoring text comparison costs. Querying a prefix avoids unrelated subtrees, but sorting child keys and producing returned words still cost work. Building a trie from scratch for one small query may be slower than filtering; repeated prefix queries make reuse more valuable.

## Practice

Implement `prototype(words, prefix, limit)` and `solve(words, prefix, limit)`. Return at most limit unique input strings beginning with the exact prefix, sorted in Unicode code-point lexicographic order. Empty words/prefixes are valid. limit 0 returns `[]`; negative limit throws RangeError.

For `["cold", "colder", "coal", "cold"]`, prefix `"co"`, limit 3, return `["coal", "cold", "colder"]`.

Prototype: filter, deduplicate and sort. Final: build a trie, follow the prefix and enumerate sorted children until the limit. Use the supplied compareText helper, include construction in runtime analysis, and preserve words on success/failure.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.

String positions and lexicographic ordering in this exercise use Unicode code points. `Array.from(text)` and string iteration expose code points; `text.length`, indexing, and default string sorting use UTF-16 code units. Do not substitute locale collation or add Unicode normalization.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
