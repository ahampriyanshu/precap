# 15. Two depots disagree about a manifest

**Track:** Harborline algorithms · **Focus:** two-dimensional DP and edit distance

## The next incident

Medical kit planning works, but radio operators transcribe the same manifest differently. Mira needs a minimum edit count to quantify how far the two identifiers differ, allowing insertions, deletions and substitutions.

**Connection:** Continue after One copy of each medical kit.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind two-dimensional DP and edit distance, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: recursively branch on the three possible final edits for every pair of prefixes.

Both functions use the same input/output contract. For example:

```python
args = ('kitten', 'sitting')
expected = 3
```

Comparing only character counts cannot distinguish ab from ba. Greedily fixing the first mismatch can also overlook that one insertion aligns a long suffix. Recursive branches revisit the same pair of prefix lengths.

## Now solve the real problem

Implement `solve`. Return unit-cost Levenshtein distance over Python string code points. There is no case folding or Unicode normalization. Transposition is not a single allowed operation.

A state is a pair of prefix lengths. Derive boundaries from converting an empty string and combine the three predecessor states. Target O(n*m) time and O(min(n,m)) auxiliary space if rows are compressed.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** An early choice can strand the next ship.
