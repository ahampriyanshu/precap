# Arrays and linear scans

A JavaScript array is an ordered sequence with zero-based indices. A linear scan visits that sequence while keeping a small summary. Totals, extrema, validation and first-occurrence positions are common uses. First decide whether the result needs a maximum value, a maximum position, or every tied position: those are different contracts.

Sorting can locate an extreme but loses the meaning of the original index and performs O(n log n) work. Separate scans for the total, maximum and first occurrence are already O(n). Combining those summaries reduces traversals while keeping the same asymptotic bound.

## State and reasoning

After reading a prefix, retain its total and the index of its first maximum. The next element extends the total. Replace the maximum index only for a strictly larger value; replacement on equality would select the last maximum. Before reading anything, the index is `null`, which represents absence without inventing position zero.

For `[6n, 2n, 6n]`, the total advances through `6n`, `8n`, `14n`, while the retained maximum index remains `0`. Every exact total must inspect every element: an unseen value can change the answer. This gives a matching linear lower bound.

Values and totals use BigInt so large integers remain exact. Indices and lengths remain Numbers. JavaScript rejects mixed BigInt/Number addition; initialize an accumulator with `0n`, and never coerce a BigInt value through Number merely to compare it.

```javascript
const exact = 10n ** 30n;
console.log(exact + 1n); // 1000000000000000000000000000001n
console.log(typeof exact, typeof [exact].length); // bigint number
```

## Cost and use

The final scan takes O(n) arithmetic operations and O(1) auxiliary values. BigInt arithmetic itself grows with operand bit length, so the unit-cost arithmetic bound is a model, not a promise of constant hardware time for arbitrary integers. Use this for one whole-array summary. Use prefix sums for repeated range totals, or a different index when updates and ordered queries dominate.

## Practice

Implement `prototype(loads)` and `solve(loads)` in `exercise.mjs`. Input is an array of nonnegative **BigInt** values. Return the two-element array `[total, firstMaximumIndex]`, where total is BigInt and the index is a Number or `null`.

Ties choose the smallest original index. `[8n, 2n, 8n]` returns `[18n, 0]`; `[0n]` returns `[0n, 0]`; `[]` returns `[0n, null]`. Values such as `10n ** 30n` are valid and totals must remain exact.

Prototype: make direct scans. Final: retain total and first maximum index in one O(n) scan with O(1) auxiliary state. Do not sort or mutate input. No additional validation is required.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
