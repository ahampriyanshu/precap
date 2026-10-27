# 16. An early choice can strand the next ship

**Track:** Harborline algorithms · **Focus:** backtracking, rollback and search pruning

## The next incident

Reconciliation identifies ships correctly. Dock repairs introduce compatibility constraints: each arriving ship can use only certain berths, and every berth can host one ship. The locally smallest available berth may be the only berth a later ship can use.

**Connection:** Continue after Two depots disagree about a manifest.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind backtracking, rollback and search pruning, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: enumerate the Cartesian product of all allowed choices, then reject repeated berths.

Both functions use the same input/output contract. For example:

```python
args = ([['A', 'B'], ['A']],)
expected = ['B', 'A']
```

For [[A,B],[A]], assigning A to the first ship strands the second even though [B,A] is feasible. A failed partial decision must be undone. DP is not automatically the best next step when the important state is a set of already-used resources.

## Now solve the real problem

Implement `solve`. Return the lexicographically smallest complete assignment in ship order, or None. Duplicate berth names within a ship’s allowed list add no choices. [] returns []. An empty allowed list makes that ship impossible to place.

Search assignments in lexicographic order and prune a branch immediately when it reuses a berth. Restore state on failure. Worst-case search remains exponential; do not claim that pruning makes it polynomial.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** Inspect the depot hierarchy by distance.
