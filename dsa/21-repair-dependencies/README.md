# 21. Road repairs must happen in the right order

**Track:** Harborline algorithms · **Focus:** directed graphs, cycles and topological sorting

## The next incident

BFS finds reachable depots, but repairs have prerequisites: a bridge inspection must finish before paving can start. A shortest route is irrelevant when the question is whether a legal work order exists.

**Connection:** Continue after The depot map is no longer a tree.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind directed graphs, cycles and topological sorting, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: enumerate task permutations and return the first lexicographic permutation satisfying every prerequisite.

Both functions use the same input/output contract. For example:

```python
args = (4, [(0, 2), (1, 2), (2, 3)])
expected = [0, 1, 2, 3]
```

An arbitrary numeric sort ignores dependencies. A cycle A-before-B-before-A has no legal order at all. A dependency is directed, unlike the undirected roads from the previous chapter.

## Now solve the real problem

Implement `solve`. An edge (u,v) means u must precede v. Return the lexicographically smallest valid ordering or None on a cycle. Duplicate edges count once. n=0 returns []. Negative n or invalid vertices raise ValueError.

Maintain the number of unfinished prerequisites. A zero-indegree frontier contains exactly the tasks currently legal; choose the smallest task for reproducibility. Target O(E+V log V) time and O(V+E) space.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** The fewest roads is not the fastest ambulance.
