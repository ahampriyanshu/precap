# 23. Subsidies invalidate the greedy frontier

**Track:** Harborline algorithms · **Focus:** Bellman-Ford, relaxation and negative cycles

## The next incident

The ambulance map works. Freight planning adds road subsidies, so a route’s accounting cost can contain negative edges. Dijkstra’s nonnegative assumption no longer describes this problem.

**Connection:** Continue after The fewest roads is not the fastest ambulance.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind Bellman-Ford, relaxation and negative cycles, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: enumerate simple routes on a tiny graph; additionally enumerate reachable simple cycles to implement the negative-cycle error contract.

Both functions use the same input/output contract. For example:

```python
args = (3, [(0, 1, 4), (0, 2, 5), (2, 1, -3)], 0)
expected = [0, 2, 5]
```

A cheaper route can arrive after an earlier vertex looked final. Worse, a reachable negative cycle makes the minimum unbounded: repeated laps reduce cost indefinitely. A negative cycle in a disconnected district does not make source-reachable routes unbounded.

## Now solve the real problem

Implement `solve`. Directed integer-weight edges may be negative. Return distances/None, but raise ValueError for a source-reachable negative cycle. Invalid graph/source also raises ValueError. Unreachable negative cycles do not raise.

After i full relaxation passes, all routes with at most i edges have had a chance to improve. A further reachable improvement after V-1 passes signals a negative cycle. Target O(V*E) time and O(V) distance space.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** Every depot asks about every other depot.
