# 17. Inspect the depot hierarchy by distance

**Track:** Harborline algorithms · **Focus:** binary trees, traversals and queues

## The next incident

Berths are assigned. Inspectors organize storage rooms into a binary hierarchy: a depot has a left wing and right wing, which may have further rooms. They need inspection rounds by depth, visiting left rooms before right rooms.

**Connection:** Continue after An early choice can strand the next ship.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind binary trees, traversals and queues, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: calculate the height, then rescan the tree for each requested depth.

Both functions use the same input/output contract. For example:

```python
args = (('hub', ('west', None, ('cold', None, None)), ('east', None, None)),)
expected = [['hub'], ['west', 'east'], ['cold']]
```

A chain of n rooms makes repeated depth scans quadratic. A depth-first traversal alone does not emit breadth levels in the required order. A queue retains the frontier between inspected and not-yet-inspected rooms.

## Now solve the real problem

Implement `solve`. A tree is None or (name,left,right), using nested tuples and unique string names. Return a list of levels, each containing names from left to right. This is a tree, not a graph with cycles.

Process exactly one frontier at a time. Target O(n) time and O(w) queue space, where w is maximum width. Avoid recursion-depth assumptions for the final traversal.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** Find the nearest lower storage code.
