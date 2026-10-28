# Bellman–Ford shortest paths

Bellman–Ford finds shortest paths from one source even when edge weights may be negative. Negative weights can represent relative adjustments or credits in a cost model. The difficulty is that an apparently expensive intermediate route may later receive a negative adjustment, so Dijkstra's settled-frontier proof no longer applies.

A negative cycle has total weight below zero. If the source can reach that cycle, repeating it makes some route costs arbitrarily small; no finite shortest answer exists for affected destinations. This exercise reports that condition with an exception for the entire request.

## Improvement travels along edges

For directed edges listed in order `(1,2,-2)`, `(0,1,4)`, `(0,2,7)`, start at source `0` with distances `[0,∞,∞]`.

- First pass: `1→2` cannot help because `1` is unreachable so far. The other edges give `[0,4,7]`.
- Second pass: `1→2` improves the cost to `2`, giving `[0,4,2]`.
- An additional scan finds no improvement.

Each full pass guarantees that paths with one more edge have had a chance to propagate.

Two passes on the deliberately inconvenient edge order expose that propagation:

```python
edges = [(1, 2, -2), (0, 1, 4), (0, 2, 7)]
distance = [0, float("inf"), float("inf")]
for _ in range(2):
    for u, v, weight in edges:
        if distance[u] != float("inf"):
            distance[v] = min(distance[v], distance[u] + weight)
    print(distance)
```

It prints `[0, 4, 7]` then `[0, 4, 2]`. A favorable edge ordering could propagate several edges in one pass. An in-place pass may propagate farther when edge order is favorable, so do not claim it considers *only* that many edges. Without a reachable negative cycle, some optimal route is simple and uses at most `V-1` edges: removing a nonnegative cycle cannot worsen it.

After `V-1` passes, a further improvement reachable from the source proves a reachable negative cycle. For example, adding `2→1` with cost `1` creates a cycle of cost `-1`; repeated passes keep decreasing distances. A negative cycle in a disconnected component is irrelevant to source reachability and must not raise under this API.

After the two required passes, test for a further reachable improvement without mutating the result:

```python
edges = [(1, 2, -2), (0, 1, 4), (0, 2, 7), (2, 1, 1)]
distance = [0, float("inf"), float("inf")]
for _ in range(2):
    for u, v, weight in edges:
        if distance[u] != float("inf"):
            distance[v] = min(distance[v], distance[u] + weight)
has_cycle = any(distance[u] != float("inf") and distance[u] + w < distance[v]
                for u, v, w in edges)
print(has_cycle)
```

It prints `True`: the reachable `1→2→1` cycle costs `-1`. The finite-source guard prevents disconnected negative edges from being mistaken for evidence.

Uncached path enumeration can explore factorially many simple paths and still needs a separate cycle check. Bellman–Ford costs O(VE) relaxation work and O(V) distance storage, excluding the input edge list. Initialization adds O(V), so a fully explicit bound is O(V+VE). Stop early after a pass with no improvements. Only relax edges whose starting vertex has a finite distance; otherwise an unreachable state must remain unreachable.

Use Dijkstra for nonnegative weights when its stronger efficiency matters. For an acyclic directed graph, topological-order relaxation handles negative edges in O(V+E) time. Bellman–Ford is useful when negative weights and cycle diagnosis are required, but can be slow on large graphs. It does not produce finite answers where reachable negative cycles make costs unbounded; choosing a larger iteration limit cannot solve that mathematical problem.

## Practice

Implement `prototype(n: int, edges: list[tuple[int, int, int]], source: int) -> list[int | None]` and `solve` with the same signature. Vertices are `0..n-1`. Directed integer-weight edges may be negative. Return minimum costs in vertex-index order, using `None` for unreachable vertices.

Example: `(3, [(0,1,4),(0,2,5),(2,1,-3)], 0)` returns `[0,2,5]`.

Raise `ValueError` for `n <= 0`, invalid source/endpoints, or any **source-reachable** negative cycle. Unreachable negative cycles do not raise. Prototype: enumerate simple paths and separately inspect reachable cycles. Final: use repeated relaxation and the extra cycle-detection pass. Preserve inputs, including on failure. Return actual integers for finite costs.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
