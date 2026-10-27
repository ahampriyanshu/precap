# 24. Every depot asks about every other depot

**Track:** Harborline algorithms · **Focus:** Floyd-Warshall and DP over allowed intermediate vertices

## The next incident

Single-source subsidy routes are correct, but a small dense city wants a complete depot-to-depot cost table for thousands of later queries. Repeating route enumeration for every pair is wasteful.

**Connection:** Continue after Subsidies invalidate the greedy frontier.

## The problem behind the method

Floyd’s Algorithm 97 starts from a matrix of direct-link lengths and produces shortest distances for all ordered pairs, referring to Warshall’s Boolean-matrix result. Our all-depot table is a direct engineering adaptation of that formulation. [Source: Floyd, Algorithm 97: Shortest Path](https://www.algol60-org.hlevkin.com/acm/097.pdf). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: enumerate simple paths independently for every ordered pair on a tiny graph, and enumerate simple cycles for the negative-cycle error contract.

Both functions use the same input/output contract. For example:

```python
args = (4, [(0, 1, 7), (0, 1, 3), (1, 2, -1), (2, 3, 2)])
expected = [[0, 3, 2, 4], [None, 0, -1, 1], [None, None, 0, 2], [None, None, None, 0]]
```

Updating by “some nearby vertex” without a state definition can miss multi-hop improvements. The useful stage is not path length here: it is which intermediate vertices are permitted. k must describe the outer stage of the recurrence.

## Now solve the real problem

Implement `solve`. Return an n-by-n directed minimum-cost matrix, None for unreachable pairs and zero diagonal unless a negative cycle exists. Keep the cheapest parallel edge. Raise ValueError for any negative cycle anywhere, negative n or invalid endpoints. n=0 returns [].

At stage k, compare the old route with one passing through k using already solved restricted routes. Target O(V^3) time and O(V^2) space. This is a sensible dense/small-graph tradeoff, not a replacement for every sparse-graph search.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** Connect the city without buying redundant cable.
