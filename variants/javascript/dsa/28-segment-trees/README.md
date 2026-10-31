# Segment trees

A segment tree stores a summary for each interval, with a parent combining its two children's summaries. Minimum is associative: regrouping the same intervals does not change the result. This supports point replacement and range minimum without rescanning every covered value.

A copied-array prototype replaces values directly and scans queries. Prefix minima cannot answer arbitrary ranges by subtraction: minimum has no inverse that removes an earlier prefix's contribution.

## State and reasoning

For `[4, 1, 7, 3]`, the left half has minimum 1, the right half 3, and the root 1. Replacing index 1 with 6 changes the left half to 4 and the root to 3. Only ancestors of that leaf depend on the changed value; other stored summaries remain valid.

A query decomposes its half-open interval into fully covered tree blocks. At each level only the boundary blocks require further splitting, so a balanced tree visits logarithmically many summaries. Build leaves once and combine parents bottom-up for linear construction; rebuilding after each set defeats the intended update bound.

Infinity can act as an internal empty minimum identity because Math.min(Infinity,x) is x. The public empty-range result is null, however; never leak Infinity or use falsiness to confuse a real zero with absence. If implementing index arithmetic with JavaScript bitwise operators, account for their signed 32-bit coercion; arithmetic parent calculations avoid silently narrowing safe Number indices.

```javascript
const emptyIdentity = Infinity;
console.log(Math.min(emptyIdentity, -4)); // -4
const halves = [4, 3]; // after changing [4,1] into [4,6]
console.log(Math.min(...halves)); // 3: recomputed root from child summaries
```

## Cost and use

Final construction and storage are O(n), with O(log(n+1)) point replacements and queries, excluding returned answers. Associativity is required; commutativity is not required for every segment-tree aggregate, so preserve block order for order-sensitive summaries. Lazy range updates are a separate extension. For a few short queries, a scan remains simpler; for point additions and sum queries, Fenwick is compact.

## Practice

Implement `prototype(temps, commands)` and `solve(temps, commands)`. Initialize internal values from temps. `["set", index, value]` replaces one value; `["min", left, right]` queries `[left, right)`. Return only query results in order, null for empty ranges. Negative values are valid.

For `[1, 5]` and `[["min", 0, 2], ["set", 0, 9], ["min", 0, 2], ["min", 1, 1]]`, return `[1, 5, null]`. Unknown operation, set index outside `[0, n)`, or a range failing `0 <= left`, `left <= right`, `right <= n` throws RangeError.

Prototype: copy and scan. Final: segment tree with O(n) construction/space and logarithmic updates/queries. Preserve both inputs and every command record on failure too.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
