# Bellman–Ford shortest paths

Bellman-Ford supports directed negative edge weights by repeatedly relaxing every edge. When no reachable negative cycle exists, a cheapest route can be chosen simple and therefore uses at most V-1 edges. Repeated passes eventually propagate all such routes.

The prototype may enumerate simple paths, but path enumeration alone cannot detect a route whose cost decreases without bound. Reachable cycles require a separate check.

## State and reasoning

Relax an edge only when its starting vertex is reachable. After V-1 passes, one additional possible improvement signals a source-reachable negative cycle. A pass with no change proves further passes cannot help, allowing early termination. In-place relaxation may propagate more than one edge in one pass; V-1 complete passes are still sufficient.

Reachability is part of the error condition. A negative cycle in another disconnected component cannot affect this source's distances and must not throw. A reachable negative self-loop is already a cycle witness. Skip null distances before adding a weight: JavaScript would otherwise coerce null to zero and invent reachability.

Keep finite costs as exact safe-integer Numbers under this lesson's input domain, and preserve null only for absence. Do not output Infinity as an unreachable marker. Parallel edges are handled by the same relaxation rule without discarding potentially cheaper costs.

```javascript
const distance = [0, null, 5];
const [from, to, weight] = [1, 2, -9];
console.log(distance[from] === null); // true: this edge cannot relax yet
console.log(distance[to]); // 5: an unreachable origin must not invent a cheaper route
```

## Cost and use

Final repeated relaxation costs O(V + VE) time with O(V) distance state beyond edges. Use it for negative-weight single-source paths or as a simple correctness baseline. For nonnegative sparse graphs, Dijkstra is usually a better fit. Global cycle detection and all-pairs distances have broader scope than this single-source contract.

## Practice

Implement `prototype(n, edges, source)` and `solve(n, edges, source)`. Vertices are 0..n-1, directed edges `[u, v, weight]` may have negative integer weights. Return minimum costs in vertex order, null for unreachable.

For n=3, edges `[[0, 1, 4], [0, 2, 5], [2, 1, -3]]`, source 0, return `[0, 2, 5]`. Throw RangeError for n<=0, invalid source/endpoints, or a **source-reachable** negative cycle. Unreachable negative cycles do not throw.

Prototype: enumerate simple paths and inspect reachable cycles separately. Final: repeated relaxation and an extra detection pass. Preserve inputs on failure too; all finite returned costs are Numbers.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
