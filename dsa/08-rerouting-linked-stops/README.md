# 08. Detaching closed depots

**Track:** Harborline algorithms · **Focus:** linked-list pointer surgery

## The next incident

The route planner stores a route as linked stop records because a live vehicle already holds a reference to its next stop. Flooded depots must be detached without copying all the surviving records or changing their identities.

**Connection:** Continue after Buying the smallest workable truck.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind linked-list pointer surgery, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: filter the stop values into a new list; this solves the small reporting problem but does not preserve live node references.

Both functions use the same input/output contract. For example:

```python
args = ([1, 2, 3, 2, 4], [1, 2])
expected = [3, 4]
```

Rebuilding records loses references held by vehicles. Consecutive removals at the head also defeat code that advances the previous pointer unconditionally. The final exercise below introduces actual nodes rather than pretending a Python list is a linked list.

## Now solve the real problem

Implement `solve`. The executable interface takes values and blocked values and returns the surviving values. Additionally implement the provided Node and detach(head,blocked) exercise described in exercise.py; identity/cycle tests in main.py enforce actual pointer preservation. Input value lists must remain unchanged.

Use a predecessor/sentinel invariant to reconnect surviving nodes. Target O(n+b) expected time for n nodes and b blocked values, with O(b) membership storage and no new surviving nodes.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** The pallet at the back blocks the door.
