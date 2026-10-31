# Dijkstra shortest paths

Dijkstra finds minimum weighted path costs when every edge has nonnegative cost. First discovery is tentative: a costly direct edge can be improved by a later route. The next vertex settled must have the globally cheapest frontier cost, not the next vertex discovered.

Enumerating simple paths is a useful small-input prototype but grows exponentially. A min-heap reuses the best tentative distances and prioritizes the next safe settlement.

## State and reasoning

A heap entry stores a copied pair `[cost, vertex]`. Whenever relaxation improves a distance, insert a new entry. An older entry for the same vertex may remain in the heap; skip it when its copied cost no longer equals the current distance. Processing stale entries needlessly can repeat a large amount of work.

Nonnegative edges justify settling the minimum: passing through a more expensive unsettled frontier cannot create a cheaper route back to it. Negative weights invalidate that argument and are rejected. Zero edges, zero cycles and parallel edges are valid. Relax only a strict improvement so a zero-cost cycle cannot generate endless equal entries.

Use null for unreachable results and check it explicitly before arithmetic. Validate every edge before indexing adjacency, even edges in a component the source never reaches. A numeric min-heap needs an explicit comparator; arrays are not automatically ordered numeric tuples in JavaScript.

```javascript
const tentative = [0, 10, 1];
const oldEntry = [10, 1];
tentative[1] = 2; // a cheaper route was discovered later
console.log(oldEntry[0] !== tentative[oldEntry[1]]); // true: this entry is stale
```

## Cost and use

With lazy heap entries, runtime is O(V+E log(E+1)) and storage O(V+E), including adjacency and stale frontier entries. This suits sparse nonnegative weighted graphs. BFS is simpler when every edge has equal unit weight; Bellman-Ford permits negative weights at a higher cost. The algorithm computes source distances, not a minimum spanning tree.

## Practice

Implement `prototype(n, edges, source)` and `solve(n, edges, source)`. Vertices are 0..n-1 and directed edges are `[u, v, weight]` with nonnegative integer weight. Parallel edges, self-loops and zero weights are valid. Return minimum Number costs in vertex order, source 0 and null unreachable.

For n=3, edges `[[0, 1, 7], [0, 2, 2], [2, 1, 1]]`, source 0, return `[0, 3, 2]`. n<=0, invalid source/endpoints or negative edge weight throws RangeError.

Prototype: enumerate simple paths. Final: Dijkstra with a min-heap and stale-entry checks. Preserve edges on success and failure.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
