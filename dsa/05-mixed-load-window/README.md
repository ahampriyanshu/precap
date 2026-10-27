# 05. A truck can carry only so many cargo kinds

**Track:** Harborline algorithms · **Focus:** sliding windows with frequency counts

## The next incident

Shift totals expose a safety problem: mixed-cargo trucks need separate storage zones. A truck may carry at most k distinct cargo labels, and Mira wants the longest consecutive portion of the manifest that fits without reordering crates.

**Connection:** Continue after One manifest, many shift reports.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind sliding windows with frequency counts, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: enumerate every contiguous range and count its distinct labels.

Both functions use the same input/output contract. For example:

```python
args = (['food', 'food', 'water', 'fuel', 'water'], 2)
expected = 3
```

Counting distinct labels for every range repeats overlapping work. Removing one occurrence is not the same as removing a label: for [food,food,water], dropping the first food still leaves food in the window. A plain set cannot track that distinction.

## Now solve the real problem

Implement `solve`. Return the maximum valid window length. limit=0 and an empty list return 0. Labels are arbitrary strings. A negative limit raises ValueError.

Maintain counts for one window; grow the right edge and shrink the left only while the distinct-kind limit is exceeded. Target O(n) expected time and O(k+1) live-count space.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** Two crates, one exact pallet.
