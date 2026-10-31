# Greedy interval scheduling

Interval scheduling chooses the largest number of compatible jobs on one timeline. Choosing the earliest start can keep one long job while excluding many short ones. Choosing shortest duration alone can also block a better arrangement. Earliest finish is the criterion that preserves the most remaining time.

Jobs occupy half-open intervals: a job starting exactly when another ends is compatible. The result also needs a canonical tie rule because several maximum-size schedules may exist.

## State and reasoning

Sort candidates by end time, then start time, then ID. Accept a candidate when its start is at least the most recently accepted end. An exchange argument explains the greedy choice: replace the first job of an optimal schedule with the earliest-finishing candidate. The replacement ends no later, so it cannot invalidate that schedule's later jobs. Repeat on the remaining suffix.

An initial last-end value of zero wrongly rejects valid negative-time jobs. Use a separate no-job-yet state. Validate every duration before producing an answer. Sorting the caller's array in place would violate preservation, so sort a copy; do not mutate nested job records either.

Use the supplied compareText helper for the final ID tie-break. Default UTF-16 sorting and localeCompare do not guarantee Unicode code-point order. A comparator must compare numeric times first and consult ID only when those times tie.

```javascript
import { compareText } from "./exercise.mjs";
const a = ["z", 0, 2], b = ["a", 0, 2];
const order = a[2] - b[2] || a[1] - b[1] || compareText(a[0], b[0]);
console.log(order > 0); // true: equal times put a before z
console.log(2 >= 2); // true: touching intervals are compatible
```

## Cost and use

A subset-enumerating prototype is exponential and must still reproduce the canonical optimum. Final sorting costs O(n log n), followed by O(n) selection; a copied array uses O(n) space. This solves maximum-count unweighted scheduling, not maximum total profit. Weighted jobs require a different recurrence, and multiple simultaneous resources need a different feasibility model.

## Practice

Implement `prototype(jobs)` and `solve(jobs)`. Each job is `[uniqueId, start, end]` with integer times and end>start. Invalid durations throw RangeError; IDs identify unique jobs. Empty input returns `[]`.

Return IDs in the exact order obtained by sorting jobs by end, start, then Unicode code-point ID order and greedily accepting start>=last accepted end. Touching jobs are compatible. `[["b", 0, 2], ["a", 0, 2], ["c", 2, 3]]` returns `["a", "c"]`.

Prototype: explore subsets but reproduce that canonical optimum. Final: earliest-finish selection, O(n log n). Use the supplied compareText for ID ordering. Preserve all input records, including on failure.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.

String positions and lexicographic ordering in this exercise use Unicode code points. `Array.from(text)` and string iteration expose code points; `text.length`, indexing, and default string sorting use UTF-16 code units. Do not substitute locale collation or add Unicode normalization.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
