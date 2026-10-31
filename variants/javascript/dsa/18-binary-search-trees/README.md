# Binary search trees

A binary search tree maintains smaller keys in every left subtree and larger keys in every right subtree. Search discards one whole subtree at each comparison. This invariant supports exact membership and floor queries: the largest stored integer no greater than a query.

An unsorted unique-key array is a useful prototype. It makes membership and removal simple to inspect, but floor and membership scans can require O(n) work.

## State and reasoning

For floor, retain the latest eligible key. A node above the query rules out its right subtree. A node at or below the query is a candidate, and only its right subtree might improve it. Returning the last visited node without tracking eligibility can return a key larger than the query.

Deletion has three structural cases. A leaf disappears; a one-child node is replaced by its child; a two-child node can use its inorder successor and then remove that successor from the right subtree. Updating the root is as important as updating an interior parent link. Duplicate add does not create duplicate keys, and missing remove must return false.

JavaScript Set supplies exact membership but no ordered floor operation; its iteration order is insertion order. The final exercise asks for an actual BST rather than sorting the entire set after every command. Return true/false for change and membership results, Numbers for present floors, and null for absent floors; 0 and false are distinct results.

```javascript
const keys = new Set([3, 1, 5]);
console.log(keys.add(3).size); // 3: adding a duplicate does not grow a set
console.log(keys.has(0), 0 === false); // false false
const node = {key: 3, left: null, right: null};
console.log(node.key); // 3: child placement must maintain the BST invariant
```

## Cost and use

BST operations take O(h) for height h. An ordinary unbalanced tree can become a chain, so O(log n) is not guaranteed without balancing. Ordered indexes are useful for predecessor/successor queries and dynamic keys; a hash Set can be preferable when only exact membership matters. Tests check observable deletion/floor behavior; inspect the implementation to justify its structure and complexity.

## Practice

Implement `prototype(commands)` and `solve(commands)`, starting with an empty key set. Commands are `[operation, key]`. add/remove return a boolean indicating whether membership changed; contains returns a boolean; floor returns the greatest stored Number<=key or null. Return one result per command. Unknown operations throw RangeError.

`[["add", 3], ["add", 3], ["floor", 4], ["remove", 9]]` returns `[true, false, 3, false]`. Empty commands return `[]`.

Prototype: an unsorted unique-key array. Final: a BST with correct deletion and floor search. Preserve commands, including on failure. Use actual booleans for boolean operations, not 0/1 substitutes.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
