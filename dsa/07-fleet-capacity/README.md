# 07. Buying the smallest workable truck

**Track:** Harborline algorithms · **Focus:** binary search over a monotone answer

## The next incident

Exact pallets are ready, but management must choose a truck capacity. Crates stay in manifest order, each trip carries a consecutive run, and the whole manifest must leave within a fixed number of days.

**Connection:** Continue after Two crates, one exact pallet.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind binary search over a monotone answer, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: test every integer capacity from the heaviest crate to the total weight, simulating loading each time.

Both functions use the same input/output contract. For example:

```python
args = ([1, 2, 3, 4, 5], 3)
expected = 6
```

With weights [10**12,10**12], checking capacities one by one is unreasonable although there are only two crates. Sorting crates is also wrong: loading order is part of the contract. More capacity can never require more trips, which supplies the searchable boundary.

## Now solve the real problem

Implement `solve`. Return the smallest integer capacity that ships positive integer weights in order within days nonempty trips. Extra available days need not be used. Empty weights returns 0 for positive days. Nonpositive days or weights raise ValueError.

Separate the greedy feasibility scan from a lower-bound search over capacities. Target O(n log(sum(weights)-max(weights)+1)) time and O(1) auxiliary space.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** Detaching closed depots.
