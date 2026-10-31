# Monotonic deques

A monotonic deque retains only values that could become a future window maximum. Rescanning each width-w window is a clear O(nw) baseline, but consecutive windows overlap heavily. A new value can make older candidates permanently unnecessary.

Keep candidate indices rather than values so equal readings with different expiry positions remain distinguishable. The deque's values decrease from front to back.

## State and reasoning

Remove expired indices from the front. Before adding a new index, remove older back candidates whose values are no larger. The newer value is at least as large and remains in future windows at least as long, so those candidates can never win again. After cleanup, the front is the current full window's maximum.

For `[9, 8, 7, 6]` with width 2, descending values remain candidates until their indices expire, yielding maxima 9,8,7. Equal values can be replaced by their newer occurrence without changing maxima. Record output only once a full window exists.

JavaScript has no built-in deque type. Repeated Array.shift() can move many elements and lose the linear bound. Use a bounded ring buffer or explicit head/tail management with a storage-reclamation policy; leaving every expired slot in a growing array does not meet an O(width) storage claim.

```javascript
const loads = [4, 4, 1];
const older = 0, newer = 1;
console.log(loads[older] === loads[newer]); // true
console.log(newer > older); // true: same value, later expiry
```

## Cost and use

Every index enters once and leaves at most once, so all front/back removals total O(n). Final time is O(n), auxiliary deque storage O(width), excluding output. Use this for moving extrema. Sum windows need only addition/subtraction; arbitrary range queries call for a different structure.

## Practice

Implement `prototype(loads, width)` and `solve(loads, width)`. Return maxima for all full contiguous windows in increasing start order. Negative values and duplicates are valid. Empty input or width>loads.length returns `[]`. width<=0 throws RangeError even for empty input.

`[9, 8, 7, 6]` with width 2 returns `[9, 8, 7]`; `[4, 4, 1, 4]` with width 2 returns `[4, 4, 4]`.

Prototype: scan each window. Final: candidate indices in a monotonic deque, O(n) time/O(width) auxiliary space. Preserve input on success and failure.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
