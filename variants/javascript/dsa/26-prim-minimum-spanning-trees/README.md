# Prim minimum spanning trees

Prim builds a minimum spanning tree by growing one connected component. At each step it adds the cheapest edge from that component to an unselected vertex. A dense matrix makes an array frontier attractive: there is already O(V²) input storage, so scanning every matrix row avoids constructing and sorting another edge list.

A prototype can convert the upper triangle into undirected edges and run an MST method such as Kruskal. The final stage works directly with the matrix.

## State and reasoning

For each unselected vertex, frontier stores the cheapest single edge into the selected component. It does not store the full path distance from the root. After selecting a new vertex, inspect its row and lower a neighbor's frontier when that row offers a cheaper connecting edge.

For costs 0-1:2, 0-2:8 and 1-2:1, selecting vertex 1 costs 2 and lowers vertex 2's connection from 8 to 1. The final tree costs 3; adding the route cost to the new edge would compute a different quantity. The cheapest frontier crosses the current cut, so the cut property justifies accepting it.

Represent missing edges distinctly from zero. JavaScript truthiness would wrongly skip zero-cost edges, and negative costs are legitimate too. Validate square shape and symmetry before treating the matrix as undirected; diagonal entries can then be ignored. If all remaining frontier entries are absent, the graph is disconnected.

```javascript
const absent = null, zeroCost = 0, negativeCost = -2;
console.log(absent === null, zeroCost !== null, negativeCost !== null); // true true true
const frontier = [0, 2, 8];
frontier[2] = Math.min(frontier[2], 1);
console.log(frontier); // [0, 2, 1]: store edge cost, not root-to-vertex distance
```

## Cost and use

Each of V selections scans a V-entry frontier and matrix row: O(V²) time and O(V) auxiliary storage. Converting and sorting matrix edges costs O(V² log(V+1)) and extra O(V²) candidates. For sparse adjacency lists, heap Prim or Kruskal may fit better. MST minimizes total connection cost, not every source-to-target travel distance.

## Practice

Implement `prototype(costs)` and `solve(costs)`. Input must be a square symmetric matrix. Number entries are undirected edge costs, null means no edge, and zero/negative costs are valid. Ignore diagonal edges only after shape/symmetry validation.

Return the MST total or null if disconnected. `[]` returns 0. `[[0, 2, 8], [2, 0, 1], [8, 1, 0]]` returns 3. Nonsquare or asymmetric matrices throw RangeError.

Prototype: convert to edges and use an MST method. Final: dense array-frontier Prim in O(V²) time/O(V) auxiliary space. Preserve every input row, including on failure.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
