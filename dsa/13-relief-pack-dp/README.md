# 13. When the largest pack is the wrong choice

**Track:** Harborline algorithms · **Focus:** dynamic programming: optimal substructure and reusable states

## The next incident

The greedy dock policy worked because every ship had equal value. The packing station now combines standardized relief packs to hit an exact requested quantity. Applying “take the biggest” here quietly wastes packs or fails to finish.

**Connection:** Continue after Serve the most ships with one dock.

## The problem behind the method

Bellman’s dynamic-programming work formalized multistage decision problems. Our pack problem reconstructs the same pressure: choices leave smaller states, and many decision sequences revisit those states. It is an adaptation, not a claim about the original application. [Source: Bellman, On the Theory of Dynamic Programming (1952)](https://pmc.ncbi.nlm.nih.gov/articles/PMC1063639/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: recursively try every pack size for every remaining quantity, without caching.

Both functions use the same input/output contract. For example:

```python
args = ([1, 3, 4], 6)
expected = 2
```

For sizes [1,3,4] and amount 6, largest-first uses 4+1+1 while 3+3 uses fewer packs. Recursive enumeration repeatedly solves the same remainder, such as 2, through different choice orders. This is both a greedy-counterexample lesson and the first DP state-design lesson.

## Now solve the real problem

Implement `solve`. Unlimited copies of each positive integer size are available. Return the minimum number of packs, or -1 if impossible. amount=0 returns 0 even with no sizes. Negative amount or nonpositive sizes raise ValueError.

State the best answer for each remaining amount, define an unreachable sentinel, and combine solved smaller amounts. Target O(amount*len(sizes)) time and O(amount) space. This is pseudo-polynomial in the numeric amount.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** One copy of each medical kit.
