# 09. The pallet at the back blocks the door

**Track:** Harborline algorithms · **Focus:** stacks and nested obligations

## The next incident

Rerouted trucks use a narrow loading bay. Every loaded pallet must be unloaded before any pallet behind it can leave. Mira needs to reject event logs that could not have happened physically.

**Connection:** Continue after Detaching closed depots.

## The problem behind the method

This is an engineering reconstruction of the design pressure behind stacks and nested obligations, not a claim that a named inventor worked on Harborline. The linked course is background reading; this chapter defines the particular engineering adaptation. [Source: MIT 6.006 lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/pages/lecture-notes/). The city and its characters are fictional; historical claims are limited to what the source supports.

## First build the small version

Implement `prototype` using this deliberately direct approach: repeatedly remove adjacent matching LOAD:x, UNLOAD:x pairs until no reduction is possible.

Both functions use the same input/output contract. For example:

```python
args = (['LOAD:a', 'LOAD:b', 'UNLOAD:b', 'UNLOAD:a'],)
expected = True
```

Matching only total load/unload counts accepts LOAD:a, LOAD:b, UNLOAD:a, UNLOAD:b even though a is blocked by b. Every new load creates an obligation that must be satisfied before older ones.

## Now solve the real problem

Implement `solve`. Return whether tokens form a complete valid LIFO log. Each token is LOAD:<nonempty-label> or UNLOAD:<nonempty-label>, with no additional colon. Malformed tokens raise ValueError. Stop at the first ordering violation; later malformed tokens are not inspected.

A stack represents the outstanding obligations in reverse access order. Target O(n) time and O(n) space; the empty prefix and unmatched final loads both matter.

Do not change the function signatures or tests. Both stages start as stubs. Unless explicitly stated above, inputs must remain unchanged. The input is valid except for the explicitly tested errors; there is no requirement to invent additional validation rules. Functionally correct code is not by itself a proof of the stated complexity.

## Check your understanding

Before coding, write down the state you retain, the invariant it represents, and one example that defeats the direct approach. After coding, explain why the method works and when its assumptions stop holding. Do not say only “it is faster”: count the repeated work it removes.

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

`main.py` contains named boundary/counterexample cases, deterministic generated cases and input-preservation checks. Larger cases run only in the final stage. The initial stubs fail intentionally with `NotImplementedError`; no tests are silently skipped.

**Next handoff:** The busiest recent loading window.
