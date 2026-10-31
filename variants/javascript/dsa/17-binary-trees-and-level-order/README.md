# Binary trees and level-order traversal

Level-order traversal groups tree nodes by depth rather than by lexical name or a depth-first path. A queue or explicit frontier captures the next structural layer. Left children are processed before right children, so each output level retains left-to-right order.

A direct prototype can determine the height and rescan the tree separately for each depth. This repeats visits and can become quadratic on a chain.

## State and reasoning

At the beginning of a level, all frontier nodes share the same depth. Visit exactly those nodes and collect their children into the next frontier, appending left before right. Do not keep processing children as part of the same level: that flattens deeper nodes into the current output row.

Input nodes are recursive arrays `[name, left, right]`. A null child is absent, not a node whose name is null. The documented structure has unique names, no shared children and no cycles, so the traversal does not need graph-style visited detection. Read the structure without rewriting child references.

In JavaScript, repeated shift() on a large queue may move many entries. Two level arrays naturally retain O(w) frontier storage. A queue with a head index avoids shifts, but retaining every consumed entry forever uses O(n) storage instead of the promised O(w); reclaim consumed storage or use frontiers.

```javascript
const root = ["a", ["b", null, null], ["c", null, null]];
const nextFrontier = [root[1], root[2]];
console.log(nextFrontier.map(node => node[0])); // ["b", "c"]
console.log(root[0]); // a: names are data, not ordering keys
```

## Cost and use

Final traversal visits each node once: O(n) time and O(w) auxiliary frontier space, excluding returned names, where w is maximum level width. A recursive DFS can also group by depth but uses stack depth and has different failure behavior for a very deep tree. Use BFS when level boundaries themselves are useful, such as breadth summaries or nearest-depth processing.

## Practice

Implement `prototype(tree)` and `solve(tree)`. Input is null or a recursive array `[name, left, right]`, with string names, no cycles, no shared children and unique names. Return one string array per depth, left-to-right. Null input returns `[]`.

`["a", ["b", null, null], ["c", null, null]]` returns `[["a"], ["b", "c"]]`. Prototype: rescan per depth. Final: process one frontier at a time in O(n) time/O(w) auxiliary space, excluding output. Preserve all names and child links. No additional validation errors.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
