# Graphs and breadth-first search

A graph has vertices and edges. Vertices represent entities; edges represent relationships. An undirected edge connects both ways. Unlike a tree, a graph may contain cycles, disconnected components, and multiple paths between the same vertices.

An adjacency list stores each vertex's neighbors. It uses O(V+E) space for `V` vertices and `E` edges, including two neighbor entries per undirected edge. It is a good representation when only a small fraction of all possible pairs are connected.

For an undirected graph, insert each edge in both directions:

```python
vertex_count = 5
edges = [(0, 1), (0, 2), (1, 3), (2, 3)]
adjacency = [[] for _ in range(vertex_count)]
for u, v in edges:
    adjacency[u].append(v)
    adjacency[v].append(u)
print(adjacency[3], adjacency[4])
```

It prints `[1, 2] []`. The isolated vertex still needs an adjacency entry and a result slot.

Breadth-first search (BFS) finds the smallest number of edges from a source when every edge has the same cost. Applications include degrees of separation, unweighted network distance, and the fewest moves in a puzzle whose moves all cost one.

## The queue creates distance layers

Take vertices `0..4` and undirected edges `(0,1)`, `(0,2)`, `(1,3)`, `(2,3)`. Vertex `4` is isolated. Start with distances `[0, None, None, None, None]` and queue `[0]`.

1. Remove `0`; discover `1` and `2` at distance `1`. Queue: `[1,2]`.
2. Remove `1`; discover `3` at distance `2`. Queue: `[2,3]`.
3. Remove `2`; `3` is already discovered, so do not enqueue it again.
4. Remove `3`; all its neighbors are already discovered.

The final result is `[0,1,1,2,None]`. Marking a vertex when it is **enqueued** prevents repeated discovery through different parents. Marking only when removed can add the same vertex many times, complicating the distance and space guarantees.

On the already-built graph below, distance assignment doubles as discovery marking:

```python
from collections import deque
adjacency = [[1, 2], [0, 3], [0, 3], [1, 2], []]
distance = [0, None, None, None, None]
queue = deque([0])
while queue:
    u = queue.popleft()
    for v in adjacency[u]:
        if distance[v] is None:
            distance[v] = distance[u] + 1
            queue.append(v)
print(distance)
```

The result is `[0, 1, 1, 2, None]`. Vertex `3` enters the queue once even though two parents can discover it.

Why is first discovery shortest? The FIFO queue processes distance `d` before distance `d+1`. Any shorter route to a newly discovered vertex would have come from an earlier layer and would already have discovered it. This proof relies on equal edge costs; a single expensive edge is not necessarily better than two cheap edges.

A direct prototype enumerates simple paths and retains the fewest hops. Avoiding repeats keeps each path finite, but there can still be factorially many paths. BFS visits each reachable vertex and its adjacency entries once. Building the representation and result gives O(V+E) time and space.

Use Dijkstra for nonnegative unequal weights. Use depth-first search if you only need reachability and its traversal order is convenient. For a single target, BFS can stop when that target is discovered; this API requests all distances. Loops and parallel edges do not change hop distances, provided the discovery check is correct. A visited set or distance array is essential even when a few examples happen to look like trees.

## Practice

Implement `prototype(n: int, edges: list[tuple[int, int]], source: int) -> list[int | None]` and `solve` with the same signature. Vertices are integers `0..n-1`. Edges are undirected; self-loops and parallel edges are allowed. Return distances in vertex-index order, with source distance `0` and `None` for unreachable vertices.

Example: `(3, [(0,1)], 0)` returns `[0,1,None]`.

Raise `ValueError` for `n <= 0`, an invalid source, or any endpoint outside `0..n-1`. Prototype: enumerate simple paths. Final: use adjacency lists and BFS in O(V+E) time and space. Preserve the edge list, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
