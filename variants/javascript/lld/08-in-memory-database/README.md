# In-Memory Database — JavaScript

## Ownership and transitions

History lookup first chooses the latest processed version at or before the queried time, then tests only that version for expiration. Searching backwards for any unexpired value wrongly resurrects overwritten content. Deletions append tombstones, and equal-timestamp reads select the last processed write. Version append is amortized O(1); binary search can make lookback O(log history), while scans visit known fields and sort names.

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

**Prototype:** RecordStore.set(key,field,value), get, and scan(key,prefix="") store arbitrary strings including empty values; set returns undefined, missing get null, scan fresh `[field,value]` pairs sorted by field name. Records/instances independent.

**Final:** TemporalDatabase methods take nonnegative nondecreasing safe-integer ts; valid reads/failed conditionals also advance accepted time, equal timestamps allowed. set(ts,key,field,value,ttl=null) writes on [ts,ts+ttl), positive integer TTL or null for forever. get reads current; delete appends absence only if visible. compareAndSet validates TTL even on mismatch, compares exact expected string, and replaces value/lifetime only on success. scan(ts,key,prefix="") returns sorted visible pairs. getAt(ts,key,field,at) requires integer 0<=at<=ts and queries processed history. Invalid TTL/lookback/time preserves both history and accepted clock. An expired newer version never exposes an older one.

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
