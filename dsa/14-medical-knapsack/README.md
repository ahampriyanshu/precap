# 14. One copy of each medical kit

**Track:** Harborline algorithms · **Focus:** 0/1 knapsack and dependency-safe DP updates

## The next incident

The unlimited-pack model is solved. Medical teams now send individually tagged kits, each with a weight and an urgency value. Every physical kit can travel at most once, and a truck has a fixed capacity.

**Connection:** Continue after When the largest pack is the wrong choice.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind 0/1 knapsack and dependency-safe DP updates, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: enumerate all subsets and retain the highest total value among those within capacity.

Both functions use the same input/output contract. For example:

```python
args = ([(2, 3), (3, 4), (4, 5)], 6)
expected = 8
```

Best value/weight can miss the optimum: kits (weight,value) (2,3),(3,4),(4,5) at capacity 6 should take the first and third. Updating one-dimensional DP in increasing capacity can accidentally reuse the same kit multiple times.

## Now solve the real problem

Implement `solve`. Return maximum total value, allowing unused capacity and an empty selection. Each item has positive weight and nonnegative integer value; capacity is a nonnegative integer. Invalid values raise ValueError. Equal-valued kits are still separate items.

The state must include which items are available, explicitly or through update order. Target O(n*C) time and O(C) space, with descending capacity updates; explain why direction enforces one-copy usage.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** Two depots disagree about a manifest.
