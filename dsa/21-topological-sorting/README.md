# Topological sorting

A directed edge `(u,v)` can mean that task `u` must finish before task `v`. A topological ordering lists all vertices so every such edge points forward in the list. Build systems, prerequisite courses, and dependency-aware job execution use this model.

Such an ordering exists exactly when the graph has no directed cycle. A cycle means each task in the cycle waits for another task in the same cycle; there is no legal first choice. A topological order need not be unique, so applications often add a tie rule for reproducible results.

## Count unfinished prerequisites

The **indegree** of a vertex is the number of incoming edges.

Build adjacency and indegree together, deduplicating before either update:

```python
vertex_count = 4
edges = [(0, 2), (1, 2), (2, 3), (0, 2)]
adjacency = [set() for _ in range(vertex_count)]
indegree = [0] * vertex_count
for u, v in edges:
    if v not in adjacency[u]:
        adjacency[u].add(v)
        indegree[v] += 1
print(indegree)
```

This prints `[0, 0, 2, 1]`. Counting the repeated `0→2` edge would disagree with the set-backed adjacency. Kahn's method starts with all zero-indegree vertices, emits one, then removes its outgoing prerequisites from the remaining graph. This exercise chooses the smallest currently legal vertex, using a min-heap.

For edges `(0,2)`, `(1,2)`, `(2,3)`:

- Initial indegrees are `[0,0,2,1]`; legal frontier is `{0,1}`.
- Emit `0`. Vertex `2` still has one unfinished prerequisite. Frontier: `{1}`.
- Emit `1`. Vertex `2` reaches indegree zero. Frontier: `{2}`.
- Emit `2`, then `3`, producing `[0,1,2,3]`.

The frontier contains exactly the remaining vertices whose prerequisites have all been emitted. Choosing its smallest member gives the lexicographically smallest ordering: any valid ordering sharing the earlier prefix must next choose from that same legal set.

The heap contains legal choices, not all unprocessed vertices:

```python
import heapq
adjacency, indegree = [{2}, {2}, {3}, set()], [0, 0, 2, 1]
frontier = [v for v, count in enumerate(indegree) if count == 0]
heapq.heapify(frontier)
order = []
while frontier:
    u = heapq.heappop(frontier)
    order.append(u)
    for v in adjacency[u]:
        indegree[v] -= 1
        if indegree[v] == 0:
            heapq.heappush(frontier, v)
print(order, len(order) == len(indegree))
```

The output is `[0, 1, 2, 3] True`. The length check is essential: a stalled frontier can otherwise leave a plausible but incomplete prefix.

If the frontier becomes empty before all vertices are emitted, a cycle remains. Do not return the partial prefix as though the ordering succeeded. A self-loop is already a cycle. Duplicate edges represent the same prerequisite in this contract and must be counted once; if construction increments indegree twice but later decrements it once, a valid graph will appear cyclic.

The baseline tries task permutations and checks each dependency, potentially exploring `V!` orders. Adjacency sets and indegree maintenance remove this repeated work. With expected constant-time edge deduplication and a heap frontier, time is O(E+V log(V+1)) and space is O(V+E). Without the smallest-choice requirement, an ordinary queue gives O(V+E) time.

Use topological sorting for ordering constraints, not for shortest paths or choosing the most profitable subset of tasks. A dependency edge does not carry duration information; computing completion times requires additional state. If tasks arrive or dependencies change continuously, rebuilding the order may be sufficient at small scale, while large dynamic graphs need a different design. Independent tasks are still vertices and must appear in the result.

## Practice

Implement `prototype(n: int, edges: list[tuple[int, int]]) -> list[int] | None` and `solve` with the same signature. Vertices are `0..n-1`; `(u,v)` requires `u` before `v`. Return the lexicographically smallest valid full ordering, or `None` when any directed cycle prevents one. Duplicate edges count once. `n=0` returns `[]`.

Example: `(3, [(0,2), (1,2)])` returns `[0,1,2]`.

Raise `ValueError` for negative `n` or invalid endpoints. Prototype: test permutations in lexicographic order. Final: maintain indegrees and a smallest-first legal frontier. Preserve inputs, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
