# 25. Connect the city without buying redundant cable

**Track:** Harborline algorithms · **Focus:** disjoint sets, Kruskal and the cut property

## The next incident

Routes are solved. A storm destroys the radio backbone, and Mira must buy fiber links connecting every depot at minimum total installation cost. This is a network-building objective, not a shortest trip from the hub.

**Connection:** Continue after Every depot asks about every other depot.

## The problem behind the method

Kruskal’s 1956 paper asks for a practical construction of a minimum-length spanning subtree. Its edge-selection construction takes the shortest remaining edge that creates no loop. Harborline’s cable budget changes the story, not that mathematical objective. [Source: Kruskal, On the Shortest Spanning Subtree (1956)](https://www.cs.yale.edu/homes/lans/readings/routing/kruskal-1956.pdf). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: enumerate edge subsets of size V-1 and test whether each is a connected tree; choose minimum total cost.

Both functions use the same input/output contract. For example:

```python
args = (4, [(0, 1, 1), (1, 2, 1), (0, 2, 1), (2, 3, 9)])
expected = (11, [(0, 1, 1), (0, 2, 1), (2, 3, 9)])
```

Buying the V-1 cheapest links can create a cheap triangle and leave a remote depot disconnected. A shortest-path tree can also cost more to build than an MST because it optimizes hub travel distances. Cycle detection must remain cheap as components merge.

## Now solve the real problem

Implement `solve`. Undirected integer-weight edges may be negative. Sort candidates by (weight,min_endpoint,max_endpoint). Return (total_cost,accepted_edges) in acceptance order, each edge normalized as (u,v,w). Ignore cycle/self-loop candidates. Return None if disconnected; n=0 or 1 returns (0,[]). Invalid n/endpoints raise ValueError.

Process links by cost and use disjoint-set representatives to reject cycles. Justify an accepted link using a cut, not merely “greedy works.” Target O(E log E) time with near-constant amortized DSU operations and O(V+E) space.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** The cable supplier quotes every pair.
