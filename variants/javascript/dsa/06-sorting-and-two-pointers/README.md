# Sorting and two pointers

Find two distinct input positions whose values sum to a target, then choose the lexicographically smallest ascending value pair. Testing every pair is a direct O(n²) baseline. Sorted order makes many pairs impossible without testing each separately.

The returned values differ from original indices. Sorting a copy is appropriate here because values are requested, while sorting the caller's array would violate preservation.

## State and reasoning

Start at the smallest and largest sorted values. If their sum is too small, every pair using that left value and any smaller right value is also too small; advance left. If too large, every pair using that right value and any larger left value is too large; decrease right. Each step discards a provably impossible family of pairs.

The first matching left value is the smallest feasible one, giving the required lexicographic tie rule. Keep left strictly before right so a single element is never reused. One 5 cannot make 10 alone; two copies of 5 can.

JavaScript's default sort compares string representations, so it orders 10 before 2. Pass a numeric comparator and sort a copied array. Negative numbers do not invalidate the pointer argument, which depends on order rather than positivity.

```javascript
const original = [10, 2, -1];
const sorted = [...original].sort((a, b) => a - b);
console.log(sorted); // [-1, 2, 10]
console.log(original); // [10, 2, -1]
```

## Cost and use

Sorting costs O(n log n), the inward scan costs O(n), and the copied array uses O(n) space. A hash-based existence query may be faster when any pair suffices, but the canonical smallest-value answer still needs a careful ordering policy. Use sorted pointers when order supports a clear elimination proof.

## Practice

Implement `prototype(weights, target)` and `solve(weights, target)`. Return the lexicographically smallest ascending array `[a, b]` with `a + b === target`, drawn from distinct positions; return null if absent. Negatives and duplicates are valid.

`[4, 1, 3, 2]` with target 5 returns `[1, 4]`; `[5]` with target 10 returns null; `[5, 5]` returns `[5, 5]`.

Prototype: inspect all pairs. Final: sort a copy and use inward pointers, O(n log n) time/O(n) auxiliary storage. Preserve input. No additional errors are required.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
