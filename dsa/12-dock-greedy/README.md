# 12. Serve the most ships with one dock

**Track:** Harborline algorithms · **Focus:** greedy interval scheduling and exchange arguments

## The next incident

The arrival board reveals overlapping docking requests. There is one working dock and every accepted ship counts equally. Choosing a long early request can block several shorter ships.

**Connection:** Continue after One arrival board from many depots.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind greedy interval scheduling and exchange arguments, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: enumerate subsets, reject overlapping subsets, and find the maximum accepted count on a tiny schedule.

Both functions use the same input/output contract. For example:

```python
args = ([('long', 0, 10), ('a', 1, 2), ('b', 2, 3), ('c', 3, 4)],)
expected = ['a', 'b', 'c']
```

Earliest-start chooses [0,10) over [1,2), [2,3), [3,4), serving one ship instead of three. Shortest duration alone is also not a universal rule. A greedy choice needs a proof tied to the objective, not a plausible slogan.

## Now solve the real problem

Implement `solve`. Return IDs selected by the deterministic earliest-finish procedure, ordering jobs by (end,start,id). Jobs use half-open intervals and must have end>start; otherwise raise ValueError. IDs are unique. Touching intervals are compatible. The prototype must return this canonical optimum, not just any optimum.

Finish-time ordering leaves the largest possible remaining suffix of time. Use an exchange argument; target O(n log n) time. Explain why the same proof fails when requests have unequal rewards.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** When the largest pack is the wrong choice.
