# Floyd–Warshall all-pairs shortest paths

Floyd-Warshall computes shortest costs between every pair of vertices. Instead of selecting source frontiers, it gradually permits more intermediate vertices on paths. A matrix is natural when every pair's result is needed and the graph is small enough for cubic work.

A prototype can run Bellman-Ford once per source and collect distance rows. The final recurrence shares work among all pairs.

## State and reasoning

Let phase k permit intermediate vertices from the first k choices. A route from i to j either avoids the new vertex or decomposes into i-to-k and k-to-j. Put k outside the i/j loops so every update follows that phase invariant; casually permuting loop order can lose it.

Initialize each diagonal to zero, retain the cheapest parallel edge, and combine only two reachable costs. A negative self-loop must override zero. After relaxation, any negative diagonal identifies a negative cycle anywhere in the graph; this global error scope differs from single-source Bellman-Ford.

Allocate independent matrix rows in JavaScript. Array(n).fill(Array(n).fill(null)) aliases every row, so changing one distance would modify unrelated rows. Missing paths stay null and must not be coerced into zero arithmetic. Empty n=0 has an empty matrix and no cycle.

```javascript
const n = 3;
const distance = Array.from({length: n}, () => Array(n).fill(null));
distance[0][0] = 0;
console.log(distance[1][0]); // null: row storage is independent
const via = [3, 2];
console.log(via[0] + via[1]); // 5: a route through one known intermediate
```

## Cost and use

Floyd-Warshall costs O(V³) time and O(V²) storage. Repeated Bellman-Ford costs O(V²(E+1)), which can be worse for dense input. Use all-pairs preprocessing when many source/target queries justify it. For one source or a sparse large graph, a single-source algorithm avoids unnecessary matrix work.

## Practice

Implement `prototype(n, edges)` and `solve(n, edges)`. Vertices are 0..n-1; directed edges are `[u, v, weight]` with integer weights. Return an n-by-n minimum-cost matrix in vertex order, null for unreachable pairs, zero diagonal when no negative cycle exists. Keep the cheapest parallel edge. n=0 returns `[]`.

For n=3 and edges `[[0, 1, 3], [1, 2, 2], [0, 2, 9]]`, return `[[0, 3, 5], [null, 0, 2], [null, null, 0]]`. Negative n, invalid endpoints or **any** negative cycle throws RangeError.

Prototype: Bellman-Ford per vertex, propagating any cycle error. Final: Floyd-Warshall O(V³) time/O(V²) space. Preserve inputs on success and failure.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
