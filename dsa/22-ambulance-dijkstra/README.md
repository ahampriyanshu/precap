# 22. The fewest roads is not the fastest ambulance

**Track:** Harborline algorithms · **Focus:** Dijkstra and nonnegative shortest paths

## The next incident

Repaired roads have different travel times. An ambulance route with one slow bridge can be worse than a route with three quick streets. Mira now needs minimum travel time, not minimum hop count.

**Connection:** Continue after Road repairs must happen in the right order.

## The problem behind the method

Dijkstra’s own retrospective describes designing a shortest-path demonstration for a nontechnical audience at the Mathematical Centre. Our ambulance map adapts the concrete problem in his paper: minimize path length between vertices with positive lengths; we also permit zero lengths. [Source: Dijkstra, retrospective on his 1959 graph paper](https://garfield.library.upenn.edu/classics1983/A1983QA19900001.pdf). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: enumerate simple paths from the source and keep the cheapest route to each vertex on a tiny map.

Both functions use the same input/output contract. For example:

```python
args = (4, [(0, 1, 10), (0, 2, 1), (2, 1, 1)], 0)
expected = [0, 2, 1, None]
```

For 0->1 cost 10, 0->2 cost 1, 2->1 cost 1, BFS favors the direct edge but the optimum costs 2. Marking a vertex finished when first discovered also freezes the wrong answer. Nonnegative costs make the smallest unsettled distance safe to finalize.

## Now solve the real problem

Implement `solve`. Directed edges are (u,v,minutes), with nonnegative integer minutes. Return distances with None for unreachable vertices. n<=0, invalid source/endpoints or negative weights raise ValueError.

Use a min-priority frontier and discard stale entries after an improvement. With a lazy heap, state O((V+E) log(E+1)) time and O(V+E) space; zero-cost edges and parallel roads must work.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** Subsidies invalidate the greedy frontier.
