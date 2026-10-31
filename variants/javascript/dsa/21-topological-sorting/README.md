# Topological sorting

A topological order respects directed precedence constraints. Several vertices can be legal next choices, so obtaining any valid order is weaker than obtaining the lexicographically smallest one. An exhaustive prototype tests permutations in sorted order and stops at the first valid full ordering.

The final algorithm maintains indegrees after already selected vertices have been removed. Exactly the zero-indegree vertices are currently legal next choices.

## State and reasoning

Choose the smallest legal vertex, emit it, and remove its outgoing edges by decrementing neighbors' indegrees. Choosing the minimum yields the smallest possible first differing position; any valid alternative must also choose a currently legal vertex, so it cannot improve on the chosen minimum.

Deduplicate edges before counting indegrees. Incrementing for duplicates but decrementing only once can manufacture a false cycle. A self-loop is a real directed cycle. If fewer than n vertices can be emitted, the remaining graph contains a cycle, and an incomplete prefix is not an acceptable result.

A FIFO queue can produce a valid order but does not enforce the minimum available choice. Use a numeric min-heap; JavaScript has no standard built-in priority queue. Repeatedly sorting or scanning the frontier may be a useful prototype, but has a different cost. Empty n=0 has a valid empty ordering, distinct from null for a cyclic graph.

```javascript
const outgoing = new Set([2, 2]);
console.log(outgoing.size); // 1: duplicate constraints count once
const ready = [10, 2, 1].sort((a, b) => a - b);
console.log(ready[0]); // 1: frontier choices use numeric order
```

## Cost and use

Deduplicated adjacency plus a min-heap gives O(V+E+V log(V+1)) time and O(V+E) storage under standard hash/set assumptions. Use topological sorting for dependency ordering and cycle detection. It does not choose task durations or schedule parallel resources; those decisions require additional state after dependencies are known.

## Practice

Implement `prototype(n, edges)` and `solve(n, edges)`. Vertices are 0..n-1; each directed edge `[u, v]` requires u before v. Return the lexicographically smallest valid full Number ordering, or null if any directed cycle prevents one. Duplicate edges count once. n=0 returns `[]`.

For n=3 and edges `[[0, 2], [1, 2]]`, return `[0, 1, 2]`. Negative n or invalid endpoints throw RangeError.

Prototype: test permutations in lexicographic order. Final: indegrees plus a smallest-first legal frontier. Preserve edges on success and failure.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
