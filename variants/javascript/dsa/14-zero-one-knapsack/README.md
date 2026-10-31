# 0/1 knapsack

0/1 knapsack chooses a subset of items whose total weight fits capacity and whose total value is largest. Each item may be used once. Duplicate item records still describe separate choices; deduplicating them would change the problem.

Enumerating all subsets is a transparent prototype. Dynamic programming instead reuses the best value for each capacity after considering a prefix of items.

## State and reasoning

A two-row recurrence decides whether the current item is excluded or included using a value from the previous item layer. One row is enough if capacities are updated downward. Then best[c-weight] still belongs to the previous layer. An upward pass reuses the same item's newly written values and changes the problem into unbounded knapsack.

With one item of weight 2 and value 3 and capacity 4, the answer is 3, not 6. Initializing every capacity to zero represents choosing nothing and allows unused capacity. A negative sentinel is unnecessary because the empty selection is always valid.

Validate capacity and every item before indexing or allocating a table. Positive weights prevent zero-width dependencies; nonnegative values keep the empty selection a legitimate lower bound. Arrays of `[weight, value]` pairs are input records, so copying only the outer array does not permit mutating their inner contents.

```javascript
const best = [0, 0, 3, 3, 3]; // after considering one [2, 3] item
console.log(best[4]); // 3: item identity prevents choosing it twice
const item = [2, 3];
const [weight, value] = item;
console.log(weight, value); // 2 3
```

## Cost and use

Subset enumeration costs O(2^n) choices. The final DP takes O(nC) time and O(C) auxiliary space for capacity C. That is pseudo-polynomial in the numeric capacity, so very large capacities may need a different strategy. This model fits indivisible independent items; fractional selection or unlimited copies requires a different algorithm.

## Practice

Implement `prototype(items, capacity)` and `solve(items, capacity)`. Each item is `[weight, value]` with positive integer weight and nonnegative integer value. Capacity is nonnegative. Return the maximum total value with each item used at most once; unused capacity and an empty selection are allowed.

`[[2, 3], [3, 4], [4, 5]]` with capacity 6 returns 8; `[[2, 3]]` with capacity 4 returns 3. Duplicate records are separate items. Negative capacity, weight<=0 or value<0 throws RangeError.

Prototype: enumerate subsets. Final: O(nC) DP/O(C) auxiliary space with dependency-safe descending updates. Preserve all inputs, including on failure.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
