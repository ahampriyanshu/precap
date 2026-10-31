# File Storage System — JavaScript

## Ownership and transitions

Quota and expiry belong to the catalog as one state owner. Copy creates a second charged entry but preserves the source absolute expiry; resetting a relative TTL would extend its lifetime. Only explicit advanceTo expires files, and removal releases bytes once. Hash lookups are expected O(1); expiry scans O(files), search sorts matches. A snapshot cannot provide a writable path around accounting.

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

**Prototype:** FileCatalog.upload(name,size) requires nonempty name/nonnegative safe integer size, returns bool; duplicate preserves old size. get returns byte count including zero or null.

**Final:** FileStorage(quota) requires nonnegative integer and starts time/usage 0. advanceTo(timestamp) requires monotonic nonnegative integer, expires at expiresAt<=timestamp, releases quota once; only this method changes time. upload(name,size,ttl=null) validates nonempty name, nonnegative size, positive optional TTL before duplicate/quota checks; success charges and sets currentTime+ttl or null. get returns `{name,size,expiresAt}` or null. copy(source,destination) validates destination first, fails unchanged for missing/existing/over-quota, charges full size and preserves absolute expiry. delete releases once and returns bool. usage is payload byte total. search(prefix,limit=10) returns fresh snapshots sorted size descending/name; negative/noninteger limit raises, zero empty. Expired names reusable; no overwrite/filesystem access.

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
