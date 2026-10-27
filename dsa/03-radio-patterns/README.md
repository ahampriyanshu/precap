# 03. The radio repeats itself

**Track:** Harborline algorithms · **Focus:** string search and KMP failure links

## The next incident

Labels now identify crates reliably. Dispatch receives a continuous radio transcript and must locate every occurrence of a distress code. Corrupted transmissions repeat long prefixes, so restarting the comparison at every character burns the radio operator’s time.

**Connection:** Continue after Letters become inventory.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind string search and KMP failure links, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: try every starting index and compare the pattern character by character.

Both functions use the same input/output contract. For example:

```python
args = ('ababa', 'aba')
expected = [0, 2]
```

Searching for aaaaab in a long run of a characters makes the direct method recheck almost the same prefix repeatedly. Also, finding aba in ababa must report positions 0 and 2; jumping past the entire first match loses the overlap.

## Now solve the real problem

Implement `solve`. Return all starting indices, including overlapping matches, using exact Python string code-point equality. An empty pattern matches every boundary 0..len(text).

A matched prefix contains information about the next viable prefix. Build failure links and reuse that information rather than rewinding the text. Target O(n+m) time and O(m) extra space; explain what your prefix-table entry means.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** One manifest, many shift reports.
