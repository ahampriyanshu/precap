# 02. Letters become inventory

**Track:** Harborline algorithms · **Focus:** strings, frequency maps and hashing

## The next incident

The first manifest is correct, but the label printer is failing. Workers cut reusable letter tiles from damaged labels to spell requested labels. Mira must know which letters are missing before printing a replacement shipment. The position of a tile does not matter; its multiplicity does.

**Connection:** Continue after The first manifest.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind strings, frequency maps and hashing, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: collect each distinct requested letter and scan both strings again to count it.

Both functions use the same input/output contract. For example:

```python
args = ('ab', 'aaa')
expected = {'a': 2}
```

A set reports no shortage for loaded="ab", requested="aaa": it remembers that a exists but loses the fact that two copies are missing. Repeated whole-string counts also revisit the same characters once per distinct letter.

## Now solve the real problem

Implement `solve`. Casefold each complete string first, then count its alphabetic code points and ignore other characters. Return only positive shortages, with keys inserted in sorted order. No Unicode canonical normalization is performed.

Count each normalized character once and subtract available counts from requested counts. Target O(n+m+u log u) time including sorted output keys and O(u) space.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** The radio repeats itself.
