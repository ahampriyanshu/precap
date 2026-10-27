# 18. Find the nearest lower storage code

**Track:** Harborline algorithms · **Focus:** binary search trees, deletion and ordering invariants

## The next incident

Inspection exposes a need for an ordered live index. Rooms are added and closed throughout a shift. Workers must find an exact storage code or the largest active code not exceeding a requested code.

**Connection:** Continue after Inspect the depot hierarchy by distance.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind binary search trees, deletion and ordering invariants, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: keep unsorted unique keys in a list and scan for membership and floor queries.

Both functions use the same input/output contract. For example:

```python
args = ([('add', 5), ('add', 3), ('add', 8), ('add', 6), ('remove', 5), ('floor', 7), ('contains', 5)],)
expected = [True, True, True, True, True, 6, False]
```

A sorted list gives quick searches but insertion still shifts elements. A BST stores the order in links, but deleting a node with two children must preserve the invariant on both subtrees. A plain unbalanced BST can still become a chain under sorted insertions.

## Now solve the real problem

Implement `solve`. Process (operation,key) commands. add/remove return whether the set changed; contains returns bool; floor returns largest key <= query or None. Duplicate add is a no-op. Return one result per command. Unknown operations raise ValueError.

Implement a BST-backed final solution, explaining predecessor/successor replacement on deletion. Operations cost O(h), not automatically O(log n); balancing is a separate design. Tests cover semantic behavior; inspect your structure to justify its complexity.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** Complete a depot name before the radio drops.
