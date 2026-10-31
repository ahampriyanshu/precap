# Backtracking and pruning

Backtracking constructs a partial assignment, explores what can follow it, then undoes the choice before trying another branch. The problem chooses one string per position while forbidding repeated strings. Enumerating complete combinations first is a simple baseline, but it wastes work on prefixes already containing a conflict.

The required result is the smallest valid vector in original position order. Sorting the chosen output values would destroy that positional meaning.

## State and reasoning

Sort and deduplicate each position's available choices, then try them in that order. A used-value Set rejects a repeated string immediately. On failure, remove that choice from both the partial vector and the used set before trying the next candidate. The first complete path is lexicographically smallest because earlier choices have been exhausted in sorted order.

For options `[["A", "B"], ["A"]]`, choosing A at the first position leaves no valid second choice, so the search must undo A and try B. A greedy choice without rollback would incorrectly report impossibility. Empty input already is a complete empty assignment; an empty inner list permits no complete assignment.

Use the supplied compareText helper for Unicode code-point ordering. Default sorting and localeCompare do not supply the same total order. Build sorted unique copies of each option list so pruning and ordering do not mutate caller-owned nested arrays.

```javascript
import { compareText } from "./exercise.mjs";
const options = ["😀", "", "😀"];
const ordered = [...new Set(options)].sort(compareText);
console.log(ordered); // ["", "😀"]: U+E000 precedes U+1F600
console.log(options.length); // 3: source choices remain unchanged
```

## Cost and use

Early rejection prunes impossible prefixes, but worst-case search remains exponential in the number of positions and choices. Sorting each position has its own preprocessing cost, and recursion/used-set state grows with assignment depth. This model suits uniqueness-constrained small searches; large matching problems may admit polynomial matching algorithms when only existence is required rather than this particular search exercise.

## Practice

Implement `prototype(allowed)` and `solve(allowed)`. Choose one string per inner array, never repeating a string. Return the lexicographically smallest complete assignment in original position order, or null if impossible. Duplicate choices within one list add no alternatives. Equality is exact; order is Unicode code-point lexicographic order using the supplied compareText.

`[["A", "B"], ["A"]]` returns `["B", "A"]`; `[["A"], ["A"]]` returns null; `[]` returns `[]`; `[[]]` returns null.

Prototype: enumerate complete combinations. Final: sorted unique options, early rejection and rollback. Preserve every input array. No extra validation is required; worst-case work remains exponential.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.

String positions and lexicographic ordering in this exercise use Unicode code points. `Array.from(text)` and string iteration expose code points; `text.length`, indexing, and default string sorting use UTF-16 code units. Do not substitute locale collation or add Unicode normalization.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
