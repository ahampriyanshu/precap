# Kruskal and disjoint sets

A minimum spanning tree (MST) connects every vertex of an undirected graph using `V-1` acyclic edges with minimum total weight. It minimizes the cost of the whole connection structure; shortest-path algorithms instead minimize route costs from a source.

Kruskal sorts edges by weight, accepting only those that join different components. A **disjoint-set union** (DSU), or union-find, tracks those components: `find(x)` returns a representative and `union(a,b)` merges two components.

## Follow the components, not just the costs

For components `{0,1}` and `{2,3}`, arrays `parent` and `size` record roots `0` and `2`, each with size two. Given those distinct roots, attach the smaller tree beneath the larger:

```python
parent, size = [0, 0, 2, 2], [2, 1, 2, 1]
a, b = 0, 2
if size[a] < size[b]:
    a, b = b, a
parent[b] = a
size[a] += size[b]
print(parent, size[a])
```

The output `[0, 0, 0, 2] 4` shows why joining roots matters: all members of the second component now reach root `0`.

For edges `0–1:1`, `1–2:2`, `0–2:3`, and `2–3:4`:

1. Initially components are `{0}`, `{1}`, `{2}`, `{3}`.
2. Accept `0–1`: components become `{0,1}`, `{2}`, `{3}`.
3. Accept `1–2`: components become `{0,1,2}`, `{3}`.
4. Reject `0–2`: both endpoints already share a representative, so it would create a cycle.
5. Accept `2–3`, producing total cost `1+2+4=7`.

Simply taking the cheapest `V-1` edges would select the triangle and leave vertex `3` disconnected. DSU supplies the missing connectivity test without traversing the whole accepted forest for every candidate.

## How union-find represents a component

Keep arrays `parent` and `size`. Initially `parent[x]=x`: each vertex is its own root. `find(x)` follows parent links until it reaches a root whose parent is itself. Two vertices are connected exactly when their roots match. **Union must join roots**, not arbitrary endpoints, or the recorded components can become incorrect.

Joining `0–1`, `2–3`, then their roots `0–2` can produce `parent=[0,0,0,2]`: vertex `3` reaches root `0` through `2`.

**Union by size** attaches the smaller component's root beneath the larger root and adds their sizes. Only root sizes remain meaningful. This prevents unnecessary tall chains: a vertex's depth grows only when its component joins one at least as large.

**Path compression** redirects visited vertices toward their root. The following variant performs path halving: each visited vertex skips a parent, shortening future walks without changing component membership.

Here `find(3)` is expanded directly so the parent mutation is visible:

```python
parent = [0, 0, 0, 2]
vertex = 3
while parent[vertex] != vertex:
    parent[vertex] = parent[parent[vertex]]
    vertex = parent[vertex]
print(vertex)
print(parent)
```

It prints root `0` and `[0, 0, 0, 0]`. The DSU links changed; the accepted graph edges did not.

For an edge `(u,v)`, compute both roots. Equal roots mean reject the edge. Different roots mean accept it and unite those roots. DSU parent links describe component bookkeeping; they are not the actual selected graph edges, so keep the accepted-edge output separately.

Why is an accepted cheapest edge safe? It crosses a cut between two current components. If an optimal spanning tree lacks it, adding it creates a cycle with another edge crossing that cut. Replacing that no-cheaper edge preserves connectivity without increasing total cost. This cut argument justifies the greedy choice.

A baseline stores the accepted forest as adjacency lists and runs DFS for each sorted candidate to detect an existing connection. This makes the same greedy choices without DSU. Each forest search costs O(V), giving O(V + E log(E+1) + EV) overall.

Sorting plus optimized DSU costs O(V + E log(E+1)) overall and O(V+E) space including candidates. Path compression and union by size give DSU an inverse-Ackermann amortized bound, effectively tiny for practical sizes. Behavior tests cannot prove these optimizations exist; inspect the parent updates.

Negative edge weights are valid: cycles are still unnecessary for connecting vertices. Self-loops cannot join components. A disconnected graph has no spanning tree; a minimum spanning forest is a different possible API. Use Prim when growing a frontier suits the graph representation, especially a dense matrix. Use shortest-path algorithms for travel costs. Deterministic edge tie-breaking matters when several MSTs share the same total weight.

## Practice

Implement `prototype(n: int, edges: list[tuple[int, int, int]]) -> tuple[int, list[tuple[int, int, int]]] | None` and `solve` with the same signature. Vertices are `0..n-1`; integer-weighted edges are undirected and may be negative.

Normalize endpoints to `(min(u,v), max(u,v), weight)`. Process candidates by `(weight, min_endpoint, max_endpoint)`, rejecting cycles/self-loops. Return `(total_cost, accepted_edges)` in acceptance order. Return `None` if disconnected; `n=0` or `1` returns `(0,[])` for valid edges.

Example: `(3, [(1,0,2),(1,2,3),(0,2,9)])` returns `(5, [(0,1,2),(1,2,3)])`.

Raise `ValueError` for negative `n` or invalid endpoints. Prototype: process sorted edges and use DFS/BFS over accepted edges to detect cycles. Final: replace those repeated traversals with DSU using path compression and union by size or rank. Preserve inputs, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
