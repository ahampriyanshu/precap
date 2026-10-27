# 06. Two crates, one exact pallet

**Track:** Harborline algorithms · **Focus:** sorting and two pointers

## The next incident

The mixed-cargo rule is under control. Pallets now require two separate crates whose combined weight exactly matches a conveyor setting. The dispatcher needs a reproducible answer even when several pairs work.

**Connection:** Continue after A truck can carry only so many cargo kinds.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind sorting and two pointers, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: try every pair of different indices and retain the lexicographically smallest sorted value pair.

Both functions use the same input/output contract. For example:

```python
args = ([5], 10)
expected = None
```

One crate of weight 5 cannot fill a 10-unit pallet by pairing with itself. Multiple valid pairs also require a documented tie rule; returning whichever pair a hash table happens to find changes the dispatch plan.

## Now solve the real problem

Implement `solve`. Return the lexicographically smallest (lighter,heavier) value pair from distinct positions, or None. Integers can be negative. Duplicate weights are separate crates.

Sort a copy and move inward according to whether the current sum is too small or too large. Explain why each discarded endpoint cannot participate in a missed valid pair. Target O(n log n) time, O(n) space for the copy.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** Buying the smallest workable truck.
