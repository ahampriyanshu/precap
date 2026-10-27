# 01. The first manifest

**Track:** Harborline algorithms · **Focus:** array scans and loop invariants

## The next incident

Mira opens Harborline with one truck and a paper list of crate weights. Before routing or optimization, she needs a trustworthy total and the position of the heaviest crate. The next truck may have no crates, and two crates may tie. This establishes the ordered manifest used throughout the series.

**Connection:** Start here: no previous chapter is required.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind array scans and loop invariants, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: walk the list, accumulate the total, and remember the first largest value; no sorting is necessary.

Both functions use the same input/output contract. For example:

```python
args = ([8, 2, 8],)
expected = (18, 0)
```

Sorting [8, 2, 8] loses original positions unless extra information is retained. Recomputing the total after every new crate repeats work. Here the direct linear scan is already optimal: an unread crate can change the result. Do not invent a more complex algorithm just because one exists.

## Now solve the real problem

Implement `solve`. Return (sum_of_weights, first_heaviest_index). Return (0, None) for an empty manifest. Weights are nonnegative integers; ties choose the smallest original index.

Maintain a total for the prefix already read and an index for its first maximum. Target O(n) time and O(1) auxiliary space.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** Letters become inventory.
