# Iterators and generators

## Iteration is a protocol

A `for` loop works with lists, files, ranges, and many other objects because they share an iteration protocol. An iterable can produce an iterator with `iter(value)`. An iterator produces one item with `next(iterator)` and raises `StopIteration` when exhausted. A list is reusable: you can create a new iterator each time. A single iterator is usually consumed once and does not reset when you loop over it again.

This protocol separates the question “how do I get the next item?” from storage. A file can yield one line at a time, and a calculated sequence can yield numbers without keeping them all in a list. This is useful for large data and pipelines whose inputs may not fit in memory.

## Generator functions

A function containing `yield` is a generator function. Calling it creates a generator iterator; its body begins when you request the first item. Each `yield` suspends execution while preserving local state. The next request resumes after that yield. A normal `return` ends the generator rather than producing another item.

```python
def squares_below(limit):
    value = 0
    while value < limit:
        yield value * value
        value += 1

numbers = squares_below(3)
print(next(numbers))
print(list(numbers))
```

The first output is `0`; the second is `[1, 4]`. The explicit `next` already consumed the first square, so converting the remaining iterator to a list does not include it again. Nothing computed all three results at the original function call.

## Laziness and memory

A generator expression defers transformations until consumption; a list comprehension computes and retains all results immediately. That changes error timing as well as memory use. A generator body can accept its arguments successfully and still fail when a consumer asks for a later item. Make the input-consumption rule part of the interface.

Ownership of the source iterator matters when consumers share a stream. Even a small probe can remove data:

```python
stream = iter(["header", "row-1", "row-2"])
same_stream = iter(stream)
print(same_stream is stream)
has_header = any(line == "header" for line in same_stream)
print(has_header)
print(list(stream))
```

The outputs are `True`, `True`, and `['row-1', 'row-2']`. Calling `iter` on this iterator returns the same cursor. `any` stops at the first match, so the probe consumes only the header here. If there were no match, it would exhaust the whole stream. A downstream stage must receive the remaining stream deliberately, a replayable source, or a buffered copy. Calling `iter` again does not rewind an iterator.

Generators retain local variables and source iterators while suspended. Laziness alone does not guarantee constant memory: sorting usually needs all items, and `itertools.tee` buffers data when its consumers progress at different speeds. The slowest consumer can therefore determine retained memory. See [`tee`'s storage tradeoff](https://docs.python.org/3.12/library/itertools.html#itertools.tee).

## Common mistakes and choices

Do not reuse an exhausted generator expecting a fresh traversal. Call the generator function again only if its source is replayable. Materialize to a list when repeated access or a snapshot is a requirement, not merely as a prelude to one loop. State whether a utility consumes all input, reads ahead, or leaves a remainder for its caller.

Inside a generator, `return` signals completion. Explicitly raising `StopIteration` from its body is converted to `RuntimeError`, so it is not the normal completion mechanism. Early loop exit also does not guarantee that a still-referenced generator releases its resources immediately. Keep file or connection ownership around the consuming scope, or explicitly close a generator you own when prompt cleanup matters. Avoid yielding from a resource scope and assuming the caller will always exhaust it.

Further reading: [Iterator and generator tutorial](https://docs.python.org/3/tutorial/classes.html#iterators).

## Practice

Read an iterable in bounded pieces. Inputs may be one-shot generators.

**Prototype:** `running_totals(values)` returns a generator/iterator yielding cumulative sums. `[2, -1, 4] -> 2, 1, 5`; empty input yields nothing. Consume values only as outputs are requested.

**Final:** `batches(values, size)` returns a generator/iterator yielding fresh lists containing at most `size` consecutive input items. A final short batch is included; empty input yields nothing. `batches(range(5), 2) -> [0, 1], [2, 3], [4]`. `size` is an integer; a size less than 1 raises `ValueError` when iteration starts (earlier is also acceptable). Construction must not consume the source, and requesting the first batch must consume only that batch. Do not precompute the full input. Buffer at most one batch, using O(size) additional storage.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
