# Binary search on the answer

Binary search can find a minimum feasible answer even when the input values are not the search space. Here capacity is the answer: weights retain their given order, and capacity determines how many contiguous groups are needed. Enumerating capacities one by one repeatedly runs the same feasibility scan.

Positive weights make feasibility monotone. If a capacity works, any larger capacity also works. The largest weight is a lower bound and the total weight is an upper bound.

## State and reasoning

For a trial capacity, append weights to the current group until the next would exceed it, then begin another group. Greedily filling each group cannot require more groups than ending that group earlier, because every later group would inherit at least as much remaining work. A feasible capacity uses at most the allowed days; extra days need not be used.

Search for the first feasible integer. A feasible midpoint can replace the upper bound; an infeasible midpoint rules out that capacity and all smaller ones. Calculate the midpoint arithmetically. JavaScript bitwise midpoint tricks coerce values to signed 32-bit integers and can corrupt valid larger Number bounds.

Validate days and every weight before deriving bounds, including when the weights array is empty. Reordering or splitting weights solves a different packing problem.

```javascript
const low = 2 ** 32, high = low + 10;
const midpoint = low + Math.floor((high - low) / 2);
console.log(midpoint); // 4294967301: no signed 32-bit coercion
```

## Cost and use

A feasibility scan costs O(n) with constant state. Searching capacities costs O(n log(S+1)), where S is the capacity interval width. Use this technique for monotone resource/cost thresholds, not predicates that switch between feasible and infeasible more than once. The baseline capacity enumeration remains useful on small instances.

## Practice

Implement `prototype(weights, days)` and `solve(weights, days)`. Return the smallest Number capacity that divides positive integer weights, in given order, into at most days nonempty contiguous groups. Empty weights return 0 for positive days. Weights cannot be reordered or split.

`[1, 2, 3, 4, 5]` with days 3 returns 6. Throw RangeError for days<=0 or any weight<=0. Prototype: enumerate capacities using a feasibility scan. Final: binary-search the capacity bound with O(1) auxiliary state. Preserve input on failure too.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
