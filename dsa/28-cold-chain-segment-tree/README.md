# 28. An increase can erase the old minimum

**Track:** Harborline algorithms · **Focus:** segment trees and associative summaries

## The next incident

The dynamic demand ledger works. Vaccine supervisors need range minimum temperatures while sensors replace previous readings. The sum ledger cannot simply subtract two prefix minima, and increasing the old minimum requires finding its replacement.

**Connection:** Continue after Yesterday’s prefix sums cannot absorb today’s corrections.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind segment trees and associative summaries, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: replace readings in a list and scan every queried range.

Both functions use the same input/output contract. For example:

```python
args = ([1, 5], [('min', 0, 2), ('set', 0, 9), ('min', 0, 2), ('min', 1, 1)])
expected = [1, 5, None]
```

For [1,5], replacing 1 with 9 makes the minimum 5. A structure storing only the old prefix minimum cannot undo that contribution by subtraction. Unlike sum, min has no inverse for a prefix-difference trick.

## Now solve the real problem

Implement `solve`. Commands are ("set",index,value) or ("min",left,right), half-open. Return only query results, using None for empty ranges. Integer readings can be negative. Invalid indices/ranges/operation names raise ValueError. Input lists remain unchanged.

Store the minimum of each segment and recompute ancestors after a point replacement. Target O(n) construction, O(log n) updates/queries and O(n) space. Empty segments need an identity internally and an explicit public result.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** You have reached this track’s current endpoint. Revisit the assumptions and compare the alternatives you have built.
