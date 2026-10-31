# Iterators, generators, and lazy work

An iterable describes how to obtain an iterator; an iterator describes how to request the next result. Generators make that state machine easier to express. They are useful when work should follow demand rather than materialize an entire collection up front.

## The protocol separates a collection from a traversal

An iterable provides Symbol.iterator. Its iterator's next method returns `{value, done}`. Some iterables create independent traversals; a generator object is normally a single traversal whose position advances. Reusing an exhausted iterator does not restart its source.

```javascript
function* numbers() { yield 2; yield 4; }
const iterator = numbers();
console.log(iterator.next()); // {value: 2, done: false}
console.log(iterator.next()); // {value: 4, done: false}
```

A generator's body starts when iteration requests work, not when the generator function is called. That timing affects validation and side effects: a thrown error in the body may arrive at next(), rather than at construction.

## Laziness shifts work, not every cost

A lazy map/filter can process a very large source with a small working set. Sorting still needs enough information to establish global order. A generator also retains its suspended locals and references to its source, so “lazy” does not automatically mean constant retained memory.

```javascript
function* selected(values) {
  for (const value of values) if (value > 0) yield value;
}
console.log([...selected([-1, 2, 0, 3])]); // [2, 3]
```

Materializing with spread or Array.from consumes the entire iterable. Use it deliberately in tests and bounded interfaces, and avoid it in a utility that promises incremental processing.

## Early termination is a lifecycle event

A for-of loop can call an iterator's return method when the consumer exits early. Generator finally blocks can therefore close files, release cursors, or unregister producers. A wrapper that manually drives next() must preserve the corresponding close behavior.

A take operation should request at most the promised number of values. Reading one extra item and discarding it is observable when the source advances a cursor, performs I/O, or charges for a record. Define the zero-limit case too: it can avoid opening the source entirely.

## Compose only compatible lifetimes

An iterable can be one-shot, infinite, expensive, or backed by a resource. A reusable collection API must not assume those properties away. A function that consumes an iterator for validation cannot then reuse it as though validation were free.

Use deterministic instrumented iterators to check demand: record each next call, return call, and yielded item. That exposes accidental buffering, over-reading, and skipped cleanup without timing-based tests. Async iterators extend the same demand/lifecycle ideas across asynchronous production, with additional cancellation and error policy.

## Practice

Prototype: implement generator `range(start, end)`, yielding safe-integer Numbers from start inclusive to end exclusive. Both endpoints must be safe integers with start <= end, or throw RangeError when consumed. Equal endpoints yield nothing.

Final: implement generator `take(iterable, limit)`. limit is a nonnegative safe integer or throws RangeError when consumed. Yield at most limit values lazily, without reading one extra. Close an opened source on early completion, consumer break, or failure. limit=0 must not open the source iterator. Preserve yielded object identity.

Complete the exported stubs in `exercise.mjs`. The prototype and final stages have separate checks.

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Use Node.js 20+ locally, or the website's browser worker. Tests are standard-library only and check the documented behavior; they do not prove performance or force garbage collection.
