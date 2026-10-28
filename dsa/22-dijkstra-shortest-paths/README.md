# Dijkstra shortest paths

Weighted shortest paths minimize the sum of edge costs, not the number of edges. A direct edge costing `9` may be worse than a two-edge path costing `2+3`. Nonnegative weights model travel time, latency, and other accumulated costs that cannot decrease by traversing an edge.

Dijkstra's algorithm keeps tentative distances and repeatedly processes the smallest available distance. **Relaxing** an edge `(u,v,w)` means testing whether reaching `u` and then paying `w` improves the current best distance to `v`.

One relaxation can invalidate an older heap offer without removing that offer:

```python
distance = [0, 7, 2]
u, v, weight = 2, 1, 1
candidate = distance[u] + weight
if candidate < distance[v]:
    distance[v] = candidate
print(distance)
print(7 == distance[1])  # Is the old offer still current?
```

The outputs are `[0, 3, 2]` and `False`; the old `(7, 1)` offer is now stale.

## Tentative distances can improve

For directed edges `0→1` cost `7`, `0→2` cost `2`, and `2→1` cost `1`, begin with distances `[0,∞,∞]` and heap `[(0,0)]`.

1. Process vertex `0` at cost `0`. Distances become `[0,7,2]`; the heap offers `(2,2)` and `(7,1)`.
2. Process vertex `2` at cost `2`. Its edge improves vertex `1` to `3`; offer `(3,1)`.
3. Process vertex `1` at cost `3`.
4. Later, `(7,1)` is stale because `7` no longer equals the stored distance. Discard it.

The final result is `[0,3,2]`. A lazy heap can retain obsolete entries instead of implementing decrease-key. Every popped entry must be checked against the current distance before expanding its edges.

This fixed nonnegative graph shows lazy deletion and strict improvement together:

```python
import heapq
adjacency = [[(1, 7), (2, 2)], [], [(1, 1)]]
distance, frontier = [0, float("inf"), float("inf")], [(0, 0)]
while frontier:
    cost, u = heapq.heappop(frontier)
    if cost != distance[u]:
        continue
    for v, weight in adjacency[u]:
        candidate = cost + weight
        if candidate < distance[v]:
            distance[v] = candidate
            heapq.heappush(frontier, (candidate, v))
print(distance)
```

It prints `[0, 3, 2]`. Strict `<` avoids creating redundant offers for equal-cost routes; the stale check avoids re-expanding vertex `1` at cost `7`.

Why can the cheapest current distance be settled? With nonnegative edges, a route reaching it through a later, no-cheaper frontier cannot reduce its cost. Negative edges break that argument. Zero-cost edges remain valid, and equal-cost alternative paths do not require repeated improvements.

A baseline enumerates simple paths, which can be factorially many. Dijkstra avoids exploring complete path combinations by retaining the best-known cost per vertex. With adjacency lists and a lazy heap, at most O(E) improvements create entries, giving O((V+E) log(E+2)) time and O(V+E) space including representation and stale heap entries. A matrix-based implementation can instead use O(V²) time, which may suit dense graphs.

Use BFS when all edge costs are equal. Use Bellman–Ford when negative weights are permitted. Dijkstra can stop at a settled target if only one destination is needed; this exercise requests distances to every vertex. A cost result does not itself reconstruct a route: that requires predecessor information and a tie policy. Validate all edges before starting, so an unreachable negative edge is still rejected under the API's nonnegative-weight contract.

## Practice

Implement `prototype(n: int, edges: list[tuple[int, int, int]], source: int) -> list[int | None]` and `solve` with the same signature. Vertices are `0..n-1`. Directed edges are `(u,v,weight)` with nonnegative integer weights. Parallel edges, self-loops, and zero weights are valid. Return integer minimum costs in vertex-index order and `None` for unreachable vertices; source cost is zero.

Example: `(3, [(0,1,7),(0,2,2),(2,1,1)], 0)` returns `[0,3,2]`.

Raise `ValueError` for `n <= 0`, invalid source/endpoints, or any negative edge weight. Prototype: enumerate simple paths. Final: use Dijkstra with a min-heap and stale-entry checks. Preserve inputs, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
