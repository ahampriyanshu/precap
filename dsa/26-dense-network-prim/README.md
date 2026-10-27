# 26. The cable supplier quotes every pair

**Track:** Harborline algorithms · **Focus:** Prim and representation-dependent algorithm choice

## The next incident

The sparse fiber project used Kruskal. A supplier now supplies a dense cost matrix for a compact district. Materializing and sorting a separate edge list adds work and memory the input representation does not require.

**Connection:** Continue after Connect the city without buying redundant cable.

## The problem behind the method

Prim’s Bell Labs paper explicitly frames connecting terminals by minimum-total-length links in communication, distribution and transportation networks. This lesson contrasts dense input handling with the previous sparse edge-list method; it does not claim Prim was the sole discoverer of MST ideas. [Source: Bell Labs, Shortest Connection Networks (1957)](https://www.nokia.com/bell-labs/publications-and-media/publications/shortest-connection-networks-and-some-generalizations/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: convert the upper triangle to edges, then use the preceding minimum-spanning-tree approach.

Both functions use the same input/output contract. For example:

```python
args = ([[0, 2, 8], [2, 0, 1], [8, 1, 0]],)
expected = 3
```

Kruskal remains correct; it is not suddenly a bad algorithm. But sorting O(V^2) quoted links costs extra log factors and edge objects. Prim can grow one connected component while retaining only each outside vertex’s cheapest connection.

## Now solve the real problem

Implement `solve`. Input is a square symmetric matrix of integer costs or None for missing links. Diagonal entries are ignored after symmetry validation. Return MST total or None if disconnected. [] returns 0. A non-square/asymmetric matrix raises ValueError.

Use a cut-based frontier with an array scan suitable for a dense matrix. Target O(V^2) time and O(V) auxiliary space. Distinguish installation cost from travel distance once more.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** Yesterday’s prefix sums cannot absorb today’s corrections.
