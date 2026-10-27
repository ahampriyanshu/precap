# 04. One manifest, many shift reports

**Track:** Harborline algorithms · **Focus:** prefix sums and half-open ranges

## The next incident

Radio incidents are searchable. The harbor accountant now asks for the weight handled during dozens of overlapping shift ranges on the same immutable manifest. Each answer is simple, but rereading the crates for every report becomes the bottleneck.

**Connection:** Continue after The radio repeats itself.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind prefix sums and half-open ranges, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: sum the requested slice independently for each query.

Both functions use the same input/output contract. For example:

```python
args = ([4, -2, 7], [(0, 3), (1, 3), (2, 2)])
expected = [9, 5, 0]
```

For n crates and q almost-full-manifest queries, the direct method performs roughly n*q additions. A prefix table performs n additions once; subtracting two entries answers a query. Negative correction entries must remain valid.

## Now solve the real problem

Implement `solve`. Return one sum per (left,right) half-open query. Empty ranges sum to zero. Values are integers and may be negative. Raise ValueError unless 0 <= left <= right <= len(values).

Define prefix[i] as the total strictly before index i. Then [l,r) is prefix[r]-prefix[l]. Target O(n+q) time and O(n) space.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** A truck can carry only so many cargo kinds.
