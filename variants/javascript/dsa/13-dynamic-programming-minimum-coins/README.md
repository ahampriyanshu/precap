# Dynamic programming: minimum coins

Minimum coins asks for an exact total with unlimited copies of each size. Greedily taking the largest size is not generally correct: sizes 1,3,4 with amount 6 lead greedy to 4+1+1, while 3+3 needs only two coins.

A recursive prototype explores every possible last coin without caching. The same remaining amounts reappear in many branches, making this a natural dynamic-programming problem.

## State and reasoning

Define best[a] as the fewest coins forming amount a. best[0] is zero, and a positive amount can be reached by choosing a final coin c and extending best[a-c]. Process increasing amounts so all smaller dependencies are known. Keep an unreachable state distinct from a real zero-coin answer.

An amount+1 sentinel is sufficient for this exercise: any reachable total formed from positive integer sizes needs at most amount coins. Do not add to a sentinel representing unbounded infinity without considering its meaning. Duplicate sizes add repeated transitions but do not alter answers.

Validate all sizes even when amount is zero. A zero size creates a self-dependency; a negative size reverses the intended dependency order and can prevent recursion from terminating. Empty sizes produce zero for amount zero and impossibility for positive amounts.

```javascript
const amount = 6;
const best = Array(amount + 1).fill(amount + 1);
best[0] = 0;
console.log(best[0], best[6]); // 0 7: base case and unreachable marker
console.log([3, 3].reduce((total, size) => total + size, 0)); // 6
```

## Cost and use

Uncached recursion can be exponential. Bottom-up DP costs O(amount * sizes.length) time and O(amount) storage, which depends on the numeric amount rather than its digit count. Use it when that table fits the workload. Greedy is only justified for denomination systems with a separate proof; a few passing examples do not establish that property.

## Practice

Implement `prototype(sizes, amount)` and `solve(sizes, amount)`. Unlimited copies of each positive integer size are available. Return the minimum count totaling amount exactly or -1 if impossible. amount 0 returns 0, including sizes `[]`.

Sizes `[1, 3, 4]` and amount 6 return 2; `[4, 6]` and amount 5 return -1. Throw RangeError for negative amount or any size<=0.

Prototype: recursive choices without caching. Final: reuse smaller-amount answers in O(amount * sizes.length) time/O(amount) space. Preserve sizes on success and failure.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
