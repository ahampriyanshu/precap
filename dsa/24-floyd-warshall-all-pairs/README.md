# Floyd–Warshall all-pairs shortest paths

All-pairs shortest paths asks for the minimum cost from every vertex to every other vertex. A matrix is useful when a small or dense graph will answer many later pair queries. Floyd–Warshall computes that matrix in O(V³) time using a dynamic-programming state based on allowed intermediate vertices.

An intermediate vertex is one visited between the route's endpoints. The algorithm's stage `k` permits vertex `k` in addition to previously permitted intermediates. This is different from Bellman–Ford's progression by path-edge count.

## The outer loop represents the state

Begin with direct-edge costs, zero on the diagonal, and infinity for missing routes.

Allocate independent rows and keep the cheapest direct edge:

```python
size, infinity = 3, float("inf")
distance = [[infinity] * size for _ in range(size)]
for vertex in range(size):
    distance[vertex][vertex] = 0
for u, v, weight in [(0, 1, 3), (1, 2, 2), (0, 2, 9)]:
    distance[u][v] = min(distance[u][v], weight)
print(distance[0])
```

It prints `[0, 3, 9]`. Using `[[infinity] * size] * size` would alias rows, so changing one edge would silently change several rows. For edges `0→1` cost `3`, `1→2` cost `2`, and `0→2` cost `9`, the initial matrix is:

```text
0   3   9
∞   0   2
∞   ∞   0
```

When intermediate vertex `1` becomes allowed, compare the old `0→2` route of cost `9` with `0→1→2`, costing `3+2=5`. Replace that entry with `5`. The final matrix is:

```text
0   3   5
∞   0   2
∞   ∞   0
```

At each stage, an optimal permitted route either avoids `k` or passes through it. In the latter case, split it into `i→k` and `k→j` subroutes. That gives the update `min(old, via_k)`. The `k` loop must be outside the endpoint loops to maintain this staged meaning. Arbitrarily rearranging the loops may miss routes requiring multiple improvements.

The independent kernel below starts from that initialized matrix:

```python
infinity = float("inf")
distance = [[0, 3, 9], [infinity, 0, 2], [infinity, infinity, 0]]
for k in range(3):
    for i in range(3):
        for j in range(3):
            distance[i][j] = min(distance[i][j], distance[i][k] + distance[k][j])
print(distance[0])
print(any(distance[v][v] < 0 for v in range(3)))
```

It prints `[0, 3, 5]` and `False`. Infinity arithmetic keeps missing routes unreachable; negative diagonal checks detect the separate negative-cycle condition.

Parallel direct edges need the cheapest weight. A negative self-loop must not disappear when initializing diagonal zero. Negative edges are allowed, but a negative diagonal after processing indicates a negative cycle. This API rejects any such cycle anywhere, even in a component unrelated to another vertex. Its all-pairs request has no distinguished source.

A useful baseline runs Bellman–Ford once from each source and collects the distance rows. A negative cycle is reachable from at least one source, so these runs also cover the all-pairs error rule without separately enumerating cycles. The baseline costs O(V² + V²E), including distance-row initialization; on dense graphs that is O(V⁴). Floyd–Warshall uses O(V²) space and O(V³) time after initialization. The output already contains V² entries, so this storage is inherent in returning a full matrix. Treat unreachable routes carefully rather than adding `None` values as numbers.

Use repeated Dijkstra for sparse nonnegative graphs when a full dense computation would waste work, or a single-source algorithm when only one source is needed. Full matrices become impractical at large `V`. Floyd–Warshall gives distances only here; reconstructing actual routes requires additional next-hop or predecessor state. Matrix row copies must be independent if you allocate mutable rows in Python.

## Practice

Implement `prototype(n: int, edges: list[tuple[int, int, int]]) -> list[list[int | None]]` and `solve` with the same signature. Vertices are `0..n-1`. Edges are directed and integer-weighted. Return an n-by-n minimum-cost matrix in vertex-index order, using `None` for unreachable pairs and zero diagonal when no negative cycle exists. Keep the cheapest parallel edge. `n=0` returns `[]`.

Example: `(3, [(0,1,3),(1,2,2),(0,2,9)])` returns `[[0,3,5],[None,0,2],[None,None,0]]`.

Raise `ValueError` for negative `n`, invalid endpoints, or any negative cycle. Prototype: run Bellman–Ford from each vertex and collect its distance row; propagate any negative-cycle error. Final: use Floyd–Warshall in O(V³) time and O(V²) space. Preserve inputs, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
