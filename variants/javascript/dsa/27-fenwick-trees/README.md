# Fenwick trees

A Fenwick tree maintains range sums while point values change. Static prefix sums answer queries quickly but an early update invalidates many prefixes. A plain array updates one point quickly but rescans long query ranges. Fenwick blocks balance both operations at logarithmic time.

Public indices are zero based; internal indices begin at one. Internal cell i summarizes the block ending there whose length is its lowest set bit.

## State and reasoning

For values `[2, 1, 4, 3, 5, 2]`, internal cell 2 covers the first two values and stores 3, cell 4 covers the first four and stores 10, and cell 6 covers the last two and stores 7. Querying prefix length 6 visits cells 6 then 4, yielding 17 from disjoint blocks.

Point additions move upward by adding lowbit; prefix queries move downward by subtracting it. Updating public index 1 starts internally at 2, then visits 4. Internal zero has lowbit zero and would never advance in an update loop. A range `[left, right)` is prefix(right)-prefix(left), so empty ranges naturally sum to zero.

JavaScript bitwise operators coerce to signed 32-bit integers. This lesson bounds array lengths below 2^31 so internal low-bit indices stay in their valid positive range; stored values and sums remain ordinary safe-integer Numbers and must not be bitwise-coerced. Add means increment, not replacement. Copy initial values into private state and preserve command records.

```javascript
const internalIndex = 6;
console.log(internalIndex & -internalIndex); // 2: lowest set bit
const cells = [0, 2, 3, 4, 10, 5, 7];
console.log(cells[6] + cells[4]); // 17: disjoint prefix blocks
```

## Cost and use

A copied-array prototype has O(1) updates and O(n) worst-case sum queries. Fenwick operations touch O(log(n+1)) cells and use O(n) storage. Repeated-add construction costs O(n log(n+1)); dedicated construction can be O(n). Use it for mutable totals and frequencies. Minimum cannot be recovered by subtracting prefixes; a segment tree supports that aggregate.

## Practice

Implement `prototype(values, commands)` and `solve(values, commands)` using internal state initialized from values. Commands are arrays: `["add", index, delta]` adds delta, and `["sum", left, right]` queries `[left, right)`. Return only sum results in command order. Negative values/deltas and empty ranges are valid.

For `[2, 4, 6]` with `[["sum", 0, 3], ["add", 0, -5], ["sum", 0, 2]]`, return `[12, 1]`. Throw RangeError for unknown operations, add index outside `[0, n)`, or any range failing `0 <= left`, `left <= right`, `right <= n`.

Prototype: copy and scan. Final: a Fenwick tree with logarithmic operations. Preserve values and all commands, including on failure. Array lengths are less than 2^31 for low-bit index operations; this bound applies to indices, not numeric sums.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
