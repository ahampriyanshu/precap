# 10. The busiest recent loading window

**Track:** Harborline algorithms · **Focus:** monotone deques

## The next incident

Valid loading logs now feed a conveyor dashboard. Supervisors need the maximum load in every fixed-width recent window, not just totals. Recomputing a maximum over overlapping windows delays the display.

**Connection:** Continue after The pallet at the back blocks the door.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind monotone deques, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: take the maximum of each width-sized slice.

Both functions use the same input/output contract. For example:

```python
args = ([9, 8, 7, 6], 2)
expected = [9, 8, 7]
```

On a descending stream every old maximum remains relevant until it expires. On repeated equal peaks, storing values without positions makes expiration ambiguous. A smaller earlier value can be discarded forever once a larger later value arrives.

## Now solve the real problem

Implement `solve`. Return maxima of all full windows. width>len(loads) gives []. Empty input gives []. Nonpositive width raises ValueError. Loads may be negative adjustments.

Store candidate indices in decreasing load order and expire indices outside the window. Each index enters and leaves at most once: O(n) time and O(width) space.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** One arrival board from many depots.
