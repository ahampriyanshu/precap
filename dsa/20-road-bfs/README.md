# 20. The depot map is no longer a tree

**Track:** Harborline algorithms · **Focus:** graph representation and breadth-first search

## The next incident

The radio directory grows into a road map. Roads form loops, and a depot can be reached by several routes. With equal travel cost per road, Mira wants the fewest road segments from a relief hub to every depot.

**Connection:** Continue after Complete a depot name before the radio drops.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind graph representation and breadth-first search, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: enumerate simple routes on a tiny graph and keep the smallest hop count for each destination.

Both functions use the same input/output contract. For example:

```python
args = (5, [(0, 1), (1, 2), (2, 0), (2, 3)], 0)
expected = [0, 1, 1, 2, None]
```

Tree traversal without visited state loops forever on 0-1-2-0. DFS’s first route need not have the fewest hops. With unit edge costs, exploring an entire distance layer before the next makes the first discovered distance final.

## Now solve the real problem

Implement `solve`. Vertices are 0..n-1. Roads are undirected (u,v); loops and parallel roads are allowed. Return hop distances, with None for unreachable vertices. n<=0, invalid source or invalid endpoints raise ValueError.

Build adjacency lists and mark vertices when enqueued, not after repeatedly discovering them. Target O(V+E) time and space. Explain why unequal edge weights break the layer argument.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** Road repairs must happen in the right order.
