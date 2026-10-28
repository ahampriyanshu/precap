# Prim minimum spanning trees

Prim's algorithm builds a minimum spanning tree by growing one connected component. At every step, choose the cheapest edge connecting a vertex already in the tree to a vertex outside it. Both Prim and Kruskal optimize total connection cost; they differ in the state they maintain and the representations they suit.

For a dense cost matrix, O(V²) Prim avoids constructing and sorting a separate edge list. The matrix already uses O(V²) storage, even when some entries denote missing edges.

## The frontier stores connection cost

Take symmetric costs `0–1:2`, `0–2:8`, and `1–2:1`. After selecting vertices `0` and `1`, inspect row `1`.

The frontier value for `2` is the cost of a **single edge into the tree**, not the distance of a path from `0`. Adding a route distance to that edge weight would turn the update into a different problem.

One row update demonstrates the difference from shortest-path relaxation:

```python
selected = [True, True, False]
best = [0, 2, 8]
row_from_one = [2, 0, 1]
for vertex, weight in enumerate(row_from_one):
    if not selected[vertex]:
        best[vertex] = min(best[vertex], weight)
print(best)
```

This prints `[0, 2, 1]`, using edge cost `1` directly rather than adding the cost already paid to reach vertex `1`.

The full growth sequence is:

- Mark `0` selected. The cheapest known connection for vertices `1` and `2` is now `2` and `8`.
- Select vertex `1` using cost `2`; running total is `2`.
- Inspect row `1`. Connecting vertex `2` through `1` costs only `1`, so replace its frontier value `8` with `1`.
- Select vertex `2`; total cost is `3`.

The invariant is that each unselected vertex records its cheapest known edge from the selected component. Scanning all unselected vertices finds the minimum edge crossing that cut. The cut property makes it safe to include: some optimal spanning tree can contain that edge without increasing total cost.

For this connected dense matrix, each selection scans the current cut:

```python
costs = [[0, 2, 8], [2, 0, 1], [8, 1, 0]]
selected, best, total = [False] * 3, [0, float("inf"), float("inf")], 0
for _ in range(3):
    u = min((v for v in range(3) if not selected[v]), key=lambda v: best[v])
    selected[u] = True
    total += best[u]
    for v, weight in enumerate(costs[u]):
        if not selected[v]:
            best[v] = min(best[v], weight)
print(total)
```

The result is `3`. This example has every edge present; missing edges and an infinite minimum frontier need explicit handling before selecting a vertex.

Each of `V` selections scans a length-V frontier and a matrix row, yielding O(V²) time and O(V) auxiliary space. A prototype can convert the upper triangle into an edge list and run Kruskal, costing O(V² log(V+1)) time and O(V²) additional candidate storage. This comparison is about representation, not one algorithm being universally superior.

If every remaining frontier value is unreachable, the graph is disconnected and no spanning tree exists. Missing edges must be represented distinctly from zero-cost edges. Negative weights are valid, as in Kruskal. Validate symmetry before relying on the matrix as an undirected graph.

For sparse adjacency lists, heap-based Prim can avoid scanning every possible pair, while Kruskal is a strong edge-list choice. Use a shortest-path algorithm when the objective is minimum travel distance from one source. If the graph changes frequently, recomputing an MST may be acceptable for small inputs; incremental maintenance is a separate design problem.

## Practice

Implement `prototype(costs: list[list[int | None]]) -> int | None` and `solve` with the same signature. The matrix must be square and symmetric. Integer entries are undirected edge costs; `None` means no edge. Zero and negative costs are valid. Diagonal entries are ignored after shape/symmetry validation.

Return the minimum spanning-tree total, or `None` if disconnected. `[]` returns `0`. Example: `[[0,2,8],[2,0,1],[8,1,0]]` returns `3`.

Raise `ValueError` for a nonsquare or asymmetric matrix. Prototype: convert to edges and use an MST method. Final: use an array frontier with O(V²) time and O(V) auxiliary space. Preserve every row, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
