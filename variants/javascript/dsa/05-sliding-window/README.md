# Sliding windows with counts

A sliding window is a contiguous range whose boundaries move forward while its summary is updated. Here the summary counts labels and the constraint permits at most k distinct labels. This supports bounded working-set analysis and longest-substring problems without rebuilding every range summary.

Enumerating all ranges with a fresh Set can cost O(n³); retaining counts separately for each start reduces that baseline to O(n²). The final algorithm reuses one moving window.

## State and reasoning

Grow the right boundary, then shrink from the left until the distinct-label count is valid again. A frequency map is necessary because removing one of two a labels leaves a still present. Delete a key only when its count reaches zero; otherwise Map.size no longer means the number of kinds in the window.

For `["a", "b", "a", "c", "b"]` with k=2, the first three labels form a valid length-three window. Adding c requires removing both the first a and then b before only two kinds remain. A single left shift would be insufficient. Measure the answer only after restoring validity.

A discarded start cannot become valid at a later right endpoint: extending a range cannot reduce its distinct count. This monotonic argument justifies never moving the left boundary backward. Exact string equality is the only label policy; case and empty labels are not normalized.

```javascript
const counts = new Map([["a", 2], ["b", 1]]);
counts.set("a", counts.get("a") - 1);
console.log(counts.get("a"), counts.size); // 1 2: one a still remains
counts.delete("b");
console.log(counts.size); // 1
```

## Cost and use

Each boundary advances at most n times, giving expected O(n) time with map operations and O(k+1) active frequency entries during restoration, excluding input/output representation. Use this when extending a range can only worsen the constraint. Some range properties are not monotone, so a moving window is not a universal replacement for range enumeration.

## Practice

Implement `prototype(labels, limit)` and `solve(labels, limit)`. Return the greatest contiguous length containing at most limit distinct strings. Empty input or limit 0 returns 0; negative limit throws RangeError.

For `["a", "a", "b", "c", "b"]` with limit 2, return 3. Prototype: enumerate ranges and count distinct values. Final: one moving window plus frequencies, expected O(n) time. Preserve labels, including when rejecting a negative limit.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
