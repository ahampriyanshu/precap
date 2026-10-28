# Stacks and nested operations

A stack stores values in **last-in, first-out** order: the newest unfinished operation must be completed first. Python lists support stack operations with `append()` and `pop()` at the end. This models nested function calls, bracket matching, undo histories, and expression parsing.

Counts are insufficient for nesting. The sequence “open a, open b, close a, close b” has matching totals, but closes the outer operation before the inner one. A stack records the order that counts discard.

A count-only summary accepts the wrong evidence:

```python
from collections import Counter
opened = ["a", "b"]
closed = ["a", "b"]
print(Counter(opened) == Counter(closed))
print(opened[-1] == closed[0])
```

It prints `True` then `False`: multiplicities agree, but the first close disagrees with the newest open label.

## Trace the outstanding operations

This exercise uses `LOAD:label` for opening an operation and `UNLOAD:label` for closing it. The labels are exact strings.

| Token | Stack after processing |
|---|---|
| `LOAD:a` | `['a']` |
| `LOAD:b` | `['a', 'b']` |
| `UNLOAD:b` | `['a']` |
| `UNLOAD:a` | `[]` |

An unload must match the top. `UNLOAD:a` when the top is `b` is an ordering violation. Unloading from an empty stack is underflow. Ending with `['a']` is also invalid because an operation remains unfinished. The invariant is that the stack contains exactly the currently outstanding labels, from oldest at the bottom to newest at the top.

With already parsed operations, the core check needs only the top label:

```python
operations = [("LOAD", "a"), ("LOAD", "b"), ("UNLOAD", "b"), ("UNLOAD", "a")]
stack, ordered = [], True
for action, label in operations:
    if action == "LOAD":
        stack.append(label)
    elif not stack or stack[-1] != label:
        ordered = False
        break
    else:
        stack.pop()
print(ordered and not stack)
```

This prints `True`. The example omits token parsing so the ordering invariant is visible; malformed syntax still needs the API’s separate exception behavior.

A direct baseline repeatedly removes adjacent matching load/unload pairs. Well-nested sequences eventually reduce to nothing; a sequence that cannot be reduced is invalid. Repeated scans and list rebuilding can cost O(n²). For this API, malformed-token handling has an additional streaming rule: stop at the first ordering violation, so a later malformed token must not override an earlier `False` result. A prototype using reductions still has to preserve that observable processing order.

The final stack method processes each token once and pushes or pops at most once, taking O(n) stack operations and O(n) worst-case storage. More precisely, parsing costs O(T), where `T` is the total number of characters inspected, and storage follows the maximum nesting depth plus label data. List-end operations are amortized constant-time.

Do not use a queue here: it would close the oldest operation first. Do not sort tokens, because their original order defines validity. A stack is inappropriate when removals may target arbitrary active labels; that needs different rules and data structures. Validation is also part of the algorithm: distinguish a syntactically malformed token, which raises an exception, from a well-formed but incorrectly ordered token, which returns `False`.

## Practice

Implement `prototype(tokens: list[str]) -> bool` and `solve` with the same signature. Each token must be exactly `LOAD:<nonempty-label>` or `UNLOAD:<nonempty-label>`, with no additional colon. Malformed tokens raise `ValueError` when reached. Return whether the complete sequence is valid LIFO order; `[]` returns `True`.

Process left to right. Return `False` at the first ordering violation without inspecting later tokens: `['UNLOAD:x', 'bad']` returns `False`. A reached `'LOAD:'` raises `ValueError`.

Prototype: use adjacent-pair reduction while preserving the processing rule. Final: use a stack. Preserve the token list, including on failure.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
