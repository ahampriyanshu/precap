# 11. One arrival board from many depots

**Track:** Harborline algorithms · **Focus:** heaps and k-way merging

## The next incident

Each depot publishes an already sorted stream of arrival times. Harborline needs one sorted board. Throwing all arrivals into a fresh global sort ignores work the depots already performed.

**Connection:** Continue after The busiest recent loading window.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind heaps and k-way merging, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: concatenate all feeds and sort the combined list.

Both functions use the same input/output contract. For example:

```python
args = ([[], [1, 4], [1, 2, 8]],)
expected = [1, 1, 2, 4, 8]
```

Comparing every feed head on every output costs O(N*k). Only the smallest current head can be emitted, and after emitting it only that one feed changes. Equal timestamps and empty feeds must not lose arrivals.

## Now solve the real problem

Implement `solve`. Input feeds are each sorted nondecreasing integer lists. Return all timestamps in nondecreasing order with duplicates preserved. Do not modify feeds.

A min-heap stores one candidate per nonempty feed. Target O(N log(k+1)) time and O(k) auxiliary space excluding output.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** Serve the most ships with one dock.
