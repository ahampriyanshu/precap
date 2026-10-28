# Arrays and linear scans

A Python list stores an ordered sequence. Its indices start at zero, so the first value in `[6, 2, 6]` is at index `0`. A linear scan visits the sequence from beginning to end, keeping only the information needed for the answer. It is the basic tool behind totals, validation, extrema, and summaries of log records or measurements.

Start with a precise question: do you need the maximum **value**, its **position**, or every position tied for maximum? Those are different contracts. Sorting can find a maximum, but it costs O(n log n), creates ordering concerns, and does extra work when the original sequence only needs to be read.

## State that explains the result

Suppose you need the total and the first maximum position for `[6, 2, 6]`. Track the total of the values already visited and the index of their first maximum:

Separate built-in scans expose the tie rule directly:

```python
values = [6, 2, 6]
total = sum(values)
peak = max(values)
first = values.index(peak)
print(total, first)
```

This prints `14 0`. `index` selects the first occurrence; `max` would need a separate empty-input policy.

| After reading | Running total | First maximum index |
|---|---:|---:|
| Nothing | 0 | None |
| Index 0: 6 | 6 | 0 |
| Index 1: 2 | 8 | 0 |
| Index 2: 6 | 14 | 0 |

The final equal value does not replace index `0`. Replacing on `>=` would select the last maximum instead.

To isolate a single summary, consider finding only the maximum value in a nonempty iterator of negative readings:

```python
readings = iter([-4, -2, -7])
peak = next(readings)
for value in readings:
    peak = max(peak, value)
print(peak)
```

This prints `-2`. Initializing `peak` to zero would invent a maximum absent from this input. A **loop invariant** is a statement that remains true after each iteration: `peak` is the maximum of the consumed prefix. The first reading establishes it, each update extends it, and exhaustion makes that prefix the whole sequence. This example keeps neither a total nor a position; those require their own state and tie policy.

A baseline can make separate passes for the total, maximum, and first maximum position. That is still O(n): a constant number of scans is linear. Combining compatible summaries into one pass reduces traversals and can support a one-pass iterator. It does not change the asymptotic bound. Any exact answer involving an arbitrary unseen value requires inspecting that value, so a general scan cannot become sublinear.

O(n) means work grows in proportion to the number of elements; O(1) auxiliary space means the summary does not grow with the input. These conventional bounds count integer arithmetic as a basic operation. Python integers can grow beyond machine-word size.

Use this approach for a full, one-time summary. For many range queries, preprocessing such as prefix sums can avoid rescanning. For frequent ordered queries, a different index may be worthwhile. Before coding, choose the empty-input result and tie rule explicitly.

## Practice

Implement `prototype(loads: list[int])` and `solve(loads: list[int])` in `exercise.py`. Both return a tuple `(total: int, first_maximum_index: int | None)`. Inputs contain nonnegative integers. Ties choose the smallest original index; `[]` returns `(0, None)`.

Example: `[8, 2, 8]` returns `(18, 0)`. A single zero returns `(0, 0)`.

For the prototype, make a direct scan. For the final version, keep the running total and first maximum index in one O(n) scan with O(1) auxiliary space. Do not sort or mutate the input. There are no additional validation requirements beyond these documented inputs.

Run from this lesson directory:

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

Both stages begin as learner stubs. Keep the function signatures and tests; `main.py` checks exact return types, boundary cases, and the documented input-preservation rules.
