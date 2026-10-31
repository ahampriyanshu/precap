# Graphs and breadth-first search

Breadth-first search finds minimum hop counts in an unweighted graph. Exploring every simple path is a direct prototype but can be exponential. BFS groups the search into layers, so first discovery already gives a vertex's shortest number of edges from the source.

For an undirected edge, both directions belong in adjacency. Self-loops and repeated edges are valid; they must not create repeated discoveries or change the source's distance zero.

## State and reasoning

Mark a vertex visited when it is enqueued, not when dequeued. Every discovered-but-unprocessed vertex already has a distance, preventing parallel edges or a cycle from adding it again. An edge from a layer-d vertex discovers previously unseen neighbors at d+1. Any shorter path would have reached that neighbor from an earlier layer, so the first distance is final.

Use null for an unreachable distance. Do not test distance truthiness: the source's valid distance 0 is falsy. Also allocate a separate adjacency array for every vertex; Array(n).fill([]) makes every row reference the same shared array.

Validate graph size, source and all endpoints before using them as array indices. A head-index queue avoids repeated shift() movement. Here O(V) retained queue storage is within the documented graph-space bound.

```javascript
const adjacency = Array.from({length: 3}, () => []);
adjacency[0].push(1);
console.log(adjacency[1].length); // 0: rows have independent identity
const distance = [0, null, null];
console.log(distance[0] !== null); // true: zero is a discovered distance
```

## Cost and use

Adjacency construction and traversal cost O(V+E) time and O(V+E) auxiliary storage. BFS is appropriate for unweighted shortest hops and level exploration. Weighted shortest costs need Dijkstra or another weight-aware algorithm; treating every weighted edge as one hop changes the problem.

## Practice

Implement `prototype(n, edges, source)` and `solve(n, edges, source)`. Vertices are Numbers 0..n-1; each edge is `[u, v]` and is undirected. Self-loops and parallel edges are allowed. Return distances in vertex order, with source 0 and null for unreachable vertices.

`n = 3`, `edges = [[0, 1]]`, `source = 0` returns `[0, 1, null]`. Throw RangeError for n<=0, invalid source or any endpoint outside 0..n-1.

Prototype: enumerate simple paths. Final: adjacency-list BFS in O(V+E) time/space. Preserve edges, including on validation failure.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
