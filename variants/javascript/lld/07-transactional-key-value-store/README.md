# Transactional Key-Value Store — JavaScript

## Ownership and transitions

A stack represents nested ownership. Inner commit merges into its immediate parent, so an outer rollback still discards that child commit. Full Map snapshots are simple because string values are immutable; delta maps need deletion markers to hide parent entries. Begin costs O(N) copying, D frames retain O(DN), and point reads/writes are expected O(1). Prefix snapshots scan and sort visible keys.

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

**Prototype:** KeyValueStore.set(key,value) returns undefined, get returns string/null, delete returns bool. Keys/values are strings, empty allowed; stored values never null. Deleting/recreating is valid.

**Final:** TransactionalStore adds begin/commit/rollback/depth, returning integer depth. Close only the innermost frame; commit merges into parent, rollback discards it. At depth zero commit/rollback raise RangeError unchanged. Reads see all innermost writes/deletions. snapshot(prefix="") returns a fresh plain object filtered by exact prefix and constructed in lexical key order. JavaScript enumeration places integer-index property names first by language rules; the snapshot follows that standard behavior. An empty prefix includes all keys.

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
