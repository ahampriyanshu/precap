# Prefix sums

A range sum totals values between two boundaries. Scanning once is reasonable for a single short query, but repeatedly scanning overlapping ranges re-adds the same values. Prefix sums pay for one preprocessing pass and answer each later query by subtraction.

Use half-open ranges `[left, right)`: include left and exclude right. Their length is `right-left`, adjacent ranges do not double-count a shared endpoint, and `[i, i)` is empty.

## State and reasoning

Define prefix[i] as the sum of values strictly before i. There are n+1 boundaries for n values, starting with zero. For `[3, -2, 5, 4]`, the boundary totals are `[0, 3, 1, 6, 10]`. A query `[1, 4)` subtracts 3 from 10, leaving 7. An empty range subtracts a boundary from itself.

The invariant relies on cancellation, not increasing totals, so negative values are valid. Validate endpoints explicitly: JavaScript slice silently clamps some invalid bounds and will not enforce this API's contract. Also, a chained mathematical comparison such as `0 <= left <= right` does not mean the same thing in JavaScript; express each comparison and combine booleans with &&.

The initial zero removes special cases for a range starting at zero. Prefix minima do not support the same subtraction trick because minimum has no inverse that removes an earlier contribution.

```javascript
const prefix = [0, 3, 1, 6, 10];
console.log(prefix[4] - prefix[1]); // 7 for [1, 4)
console.log(prefix[2] - prefix[2]); // 0 for an empty range
const left = 1, right = 4, length = 4;
console.log(0 <= left && left <= right && right <= length); // true
```

## Cost and use

Independent range scans cost O(nq) in the worst case. One prefix table yields O(n+q) total time and O(n) auxiliary storage. Use it for static measurements, event counts or repeated report totals. For interleaved point updates, changing an early value invalidates many prefixes; a Fenwick or segment tree can be more appropriate.

## Practice

Implement `prototype(values, queries)` and `solve(values, queries)`. Each query is the array `[left, right]` and requests the sum of `[left, right)`. Return Number results in query order. Negative values are valid and empty ranges return zero.

For `values = [4, -2, 7]` and `queries = [[0, 3], [1, 3], [2, 2]]`, return `[9, 5, 0]`. Throw RangeError for any query not satisfying `0 <= left`, `left <= right`, and `right <= values.length`.

Prototype: sum each range independently. Final: build one prefix table for O(n+q) time/O(n) auxiliary space. Preserve both inputs on success and failure.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
