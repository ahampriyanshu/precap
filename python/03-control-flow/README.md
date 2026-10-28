# Control flow

## Making decisions

Programs choose actions and repeat work. `if`, `elif`, and `else` select a branch according to boolean expressions. Python uses indentation to mark a block, so statements at the same indentation belong together. Comparisons such as `score >= 50` produce booleans; `and`, `or`, and `not` combine conditions. Conditions are tested from top to bottom, and only the first matching branch in one chain runs.

## Repetition

A `for` loop consumes an iterable; `range(4)` supplies integers zero through three. `enumerate` supplies indices without manual bookkeeping. `while` repeats while its condition holds, so progress and termination need an explicit argument. `continue` skips one iteration's remaining body; `break` stops the loop.

`zip` stops at the shortest input by default. When pairing requires equal cardinality, silent truncation can turn missing data into apparent success. Python 3.10+ offers a checked form:

```python
names = ["east", "west"]
limits = [8]
accepted = []
try:
    for name, limit in zip(names, limits, strict=True):
        accepted.append((name, limit))
except ValueError:
    print("length mismatch")
print(accepted)
```

The output is `length mismatch` and `[('east', 8)]`. Validation is lazy: the first pair was already processed before the mismatch was discovered. If partial updates are forbidden, stage results before committing them, or validate reusable input lengths first. Checking two lists' lengths is cheap; doing so for arbitrary streams may require buffering. See [`zip` semantics](https://docs.python.org/3.12/library/functions.html#zip).

## Worked example

An early exit should express a deliberate completion condition. A loop's `else` block runs only when iteration finishes without `break`:

```python
states = ["retry", "retry", "ready"]
for attempt, state in enumerate(states, start=1):
    if state == "ready":
        print(f"accepted on attempt {attempt}")
        break
else:
    print("no ready state")
print("inspection complete")
```

The output is `accepted on attempt 3` followed by `inspection complete`. The `else` belongs to `for`, not to the inner `if`. An empty sequence would execute `else`, because no successful early exit occurred. Exceptions and returns also leave the loop, but do not represent normal exhaustion. This pattern can encode a search without a separate found flag; use it only when the exhaustion rule reads clearly to the team.

Truth testing lets empty collections, zero, and `None` count as false. This is convenient for `if names:`, but it can hide a distinction when zero is a valid value and `None` means missing. Use an explicit comparison when that distinction matters. `and` and `or` short-circuit, meaning the right operand is evaluated only if needed; they return an operand rather than necessarily returning a boolean.

## Practical uses and mistakes

Choose a loop when several steps, early stopping, or error handling determine progress. A comprehension is clearer for a compact transformation or filter and should not exist solely to trigger side effects. `and` and `or` short-circuit and return an operand, so `configured_limit or 10` replaces a legitimate zero. Use an explicit `None` check when zero and missing mean different things.

Returning inside a loop can accidentally stop after the first item. Removing entries from the list currently being traversed can skip work. Construct a new result or traverse a deliberate snapshot. For nested loops, estimate the number of combinations: a short block can still do quadratic work. Establish what must hold before and after each iteration; that invariant is often more useful than stepping through one successful input.

## Using the supplied function shells

Replace each supplied `raise NotImplementedError` with an indented body, preserving the signature. `return` ends the entire call; `break` ends only the innermost loop. Check empty inputs and boundary positions explicitly when reasoning about a loop. A test that finds a match late in the input is more informative than one that always succeeds on its first item.

## Practice

Filter numeric measurements and find a stopping point. Inputs are lists of integers; no type checks are required.

**Prototype:** `count_positive(values)` returns the number of values strictly greater than zero. Empty input returns 0.

**Final:** `first_total_at_least(values, target)` adds values from left to right. After each addition, if the running total is at least `target`, return that item's zero-based index. Return `None` if no addition reaches the target. Empty input always returns `None`, even for target 0. Negative values and negative targets are allowed. Examples: `([2, 3, 1], 5) -> 1`, `([2, -4, 7], 5) -> 2`, `([0], 0) -> 0`. Do not mutate the input. Stop at the first qualifying prefix; linear work in the worst case.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
