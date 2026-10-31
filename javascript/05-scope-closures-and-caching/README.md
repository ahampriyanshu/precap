# Scope, closures, and bounded caching

A closure is a function together with access to its lexical environment. It enables private counters, configured clients, callback factories, and memoization without placing state in a global variable. The same mechanism can retain large objects long after a request or view disappears.

## Lexical scope follows where code is defined

A function resolves outer bindings through the environment in which it was created. Closures capture bindings, so they can observe later changes to those bindings; they do not automatically freeze a snapshot. Block-scoped let creates useful per-iteration bindings, while var has function scope.

```javascript
const readers = [];
for (let i = 0; i < 3; i++) readers.push(() => i);
console.log(readers.map(read => read())); // [0, 1, 2]
```

This is why a delayed callback can see a different value from the one expected when it was scheduled. Capture a deliberate immutable value when a snapshot is required. A framework may introduce additional rules about which render's closure is being used, but the underlying lexical mechanism remains the same.

## Factory-local state belongs to one instance

A factory invocation can create a fresh environment and return operations that share it. Separate factory calls should create independent state. An outer module-level variable instead creates one shared lifetime for all consumers.

```javascript
function configuredMultiplier(factor) {
  return value => value * factor;
}
const triple = configuredMultiplier(3);
console.log(triple(4)); // 12
```

Private state still needs a contract. Validate an update before modifying a counter, and leave the previous value intact when an operation is rejected. If a returned object exposes a mutable reference into that private state, the closure no longer provides the isolation readers may assume.

## Memoization needs a key and a validity rule

Memoization reuses an earlier result for an equivalent call. Argument identity, receiver identity, external dependencies, and invalidation determine whether reuse is correct. JSON.stringify is not a universal key: supported values, property order, undefined, cycles, BigInt, and custom objects complicate it.

A one-entry identity cache is deliberately modest: compare the receiver and arguments with Object.is, retain only the last successful result, and define whether a thrown call replaces that entry. Object.is distinguishes 0 from -0 and treats NaN as equal to itself. Those details are observable and should be intentional.

## Retention is part of the optimization cost

A cache retains arguments and results. Even a one-entry cache can hold a very large graph, while an unbounded Map can keep every past request alive. Bound the cache by entry count and sometimes bytes; attach it to the correct owner and clear it when its validity ends.

An asynchronous memoizer needs additional decisions: share an in-flight promise, evict rejected work, handle cancellation per caller, and partition permissions or tenants. A synchronous memoizer's contract does not establish those guarantees. Measure whether avoided work exceeds keying, copying, and retention costs before introducing broader caching.

## Practice

Prototype: `makeCounter(start = 0)` returns a function `(step = 1) => nextValue`. start, step, and the result must be safe-integer Numbers. Throw RangeError on invalid arithmetic and keep the prior value after a failed update. Factory instances are independent.

Final: `memoizeOne(fn)` returns an ordinary function preserving its dynamic receiver. Cache only the last successful invocation, comparing receiver and every argument with Object.is. A thrown call must not replace that successful entry. Reuse the exact result object for a cache hit; do not stringify or deeply compare arguments.

Complete the exported stubs in `exercise.mjs`. The prototype and final stages have separate checks.

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Use Node.js 20+ locally, or the website's browser worker. Tests are standard-library only and check the documented behavior; they do not prove performance or force garbage collection.
