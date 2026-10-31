# Kruskal and disjoint sets

Kruskal builds a minimum spanning tree by considering the cheapest candidate edges first and accepting only edges joining separate components. Simply choosing the cheapest V-1 edges can form a cycle while leaving another vertex disconnected. Connectivity is the condition that makes greedy selection safe.

A baseline stores the accepted forest and runs DFS/BFS for each candidate to check whether its endpoints already connect. Disjoint sets replace those repeated traversals with a compact component index.

## State and reasoning

Each vertex starts as its own parent/root. find follows parents; two vertices are connected exactly when their roots match. Union must join roots, not arbitrary endpoints. Union by size attaches the smaller component's root below the larger; path compression shortens future find walks. DSU links describe bookkeeping, not the actual graph edges, so keep accepted edges separately.

The cut property proves a chosen cheapest cross-component edge is safe. Adding it to an optimal spanning tree creates a cycle; replacing another no-cheaper edge crossing the same cut preserves connectivity without increasing cost. Negative edge weights do not invalidate this argument. A self-loop never joins two components.

Normalize endpoint order before sorting, and compare candidates by weight, lower endpoint, then upper endpoint. Default array sort is not that comparator. Return accepted edges in their selection order. Fewer than V-1 accepted edges means no spanning tree; a minimum spanning forest is a different API.

```javascript
const [u, v, weight] = [3, 1, -2];
const normalized = [Math.min(u, v), Math.max(u, v), weight];
console.log(normalized); // [1, 3, -2]
const parents = Array.from({length: 4}, (_, index) => index);
console.log(parents); // [0, 1, 2, 3]: initially separate components
```

## Cost and use

Sorting plus compressed, size/rank-balanced DSU costs O(V + E log(E+1)) overall under the usual near-constant amortized DSU bound, with O(V+E) space including copied candidates. Repeated forest searches add O(EV) worst-case work. Use Kruskal for edge-list connection cost, Prim for a useful frontier representation, and shortest-path algorithms for travel costs from a source.

## Practice

Implement `prototype(n, edges)` and `solve(n, edges)`. Vertices are 0..n-1; undirected integer-weight edges `[u, v, weight]` may be negative. Normalize to `[Math.min(u,v), Math.max(u,v), weight]`. Process by weight, lower endpoint, upper endpoint, rejecting cycles and self-loops.

Return `[totalCost, acceptedEdges]` with edges in acceptance order, or null if disconnected. n=0 or 1 returns `[0, []]` for valid edges. For n=3 and `[[1, 0, 2], [1, 2, 3], [0, 2, 9]]`, return `[5, [[0, 1, 2], [1, 2, 3]]]`.

Negative n or invalid endpoints throws RangeError. Prototype: sorted candidates plus DFS/BFS cycle checks over accepted edges. Final: path-compressed DSU with union by size/rank. Preserve all edge records, including on failure.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
