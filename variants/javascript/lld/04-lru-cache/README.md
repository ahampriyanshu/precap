# LRU Cache — JavaScript

## Ownership and transitions

A cache owns recency as well as values. JavaScript Map preserves insertion order, but setting an existing key does not move it; a refresh must establish the desired order deliberately. Missing reads must not refresh anything, and capacity zero still validates requests. Expected point operations are O(1); detached item snapshots cost O(entries).

## JavaScript boundaries

Use native classes with per-instance state and plain object/array snapshots. Object assignment shares a reference; copy retained inputs and every outward mutable container, including nested arrays. `null` means absence. `Map` handles arbitrary string keys safely, including `"__proto__"`; do not confuse a missing key with zero or an empty string. Domain validation uses `RangeError`. Numeric inputs must satisfy `Number.isSafeInteger`, so booleans, fractions, infinities, and NaN are invalid where an integer is required. All documented aggregate results and timestamp-plus-duration sums fit the safe-integer range. Strings use exact case-sensitive equality; lexical order compares JavaScript UTF-16 code units. Calls are serialized and synchronous.

```javascript
const internal = ["initial"];
const snapshot = [...internal];
snapshot.length = 0;
console.assert(internal.length === 1);
```

A detached snapshot protects ownership; the service still has to validate and commit a coherent transition.

## Practice

**Prototype:** `touchOrder(keys,key)` takes distinct nonempty keys and returns a new oldest-to-newest list with key once at end. Preserve input; no capacity limit.

**Final:** `new LRUCache(capacity)` requires nonnegative safe integer. Keys nonempty; values any safe integer (negative allowed). `put` inserts/updates, refreshes, evicts oldest if needed, and returns undefined. At zero capacity valid put does nothing. `get(key,fallback=null)` returns hit value and refreshes, or exact fallback identity without order change. `delete` removes once and returns bool. `items()` returns fresh `[key,value]` pairs least-recent first. Invalid data changes no value/order.

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
