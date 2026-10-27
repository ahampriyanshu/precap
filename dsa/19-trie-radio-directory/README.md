# 19. Complete a depot name before the radio drops

**Track:** Harborline algorithms · **Focus:** tries and prefix indexes

## The next incident

Numeric room lookup is solved. Radio workers enter partial depot names, and many names share the same prefixes. Repeatedly scanning the whole directory for every keystroke wastes the structure in those prefixes.

**Connection:** Continue after Find the nearest lower storage code.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind tries and prefix indexes, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: scan every word, filter by startswith, deduplicate and sort the matches.

Both functions use the same input/output contract. For example:

```python
args = (['cold', 'colder', 'coal', 'cold'], 'co', 3)
expected = ['coal', 'cold', 'colder']
```

A hash table answers exact membership but cannot jump directly to all names beginning with cold-. A trie shares prefix paths. A terminal marker is essential: cold can be a complete name and a prefix of colder at the same time.

## Now solve the real problem

Implement `solve`. Return at most limit unique matching words in Python lexicographic order. Matching is exact and case-sensitive. Empty words and empty prefix are valid. Negative limit raises ValueError; zero returns []. The interface rebuilds per call; discuss how a long-lived index would amortize construction.

Build a trie, walk the prefix, then enumerate children in sorted character order until limit results are found. Include construction cost O(total characters); query cost depends on prefix length and visited output subtree, not magically O(1).

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** The depot map is no longer a tree.
