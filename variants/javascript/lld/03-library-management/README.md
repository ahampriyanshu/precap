# Library Management System — JavaScript

## Ownership and transitions

Title equality and physical copy identity are different keys. A member may hold one active copy of a title; duplicate-title validation precedes exhaustion checks. Returning checks owner before releasing the copy. Keep one authoritative loan record rather than parallel mutable flags. A small implementation scans copies O(copies), with direct loan ownership lookup in a map.

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

**Prototype:** `availableCopies(copies,title)` takes valid `[copyId,title,availableBoolean]` tuples and returns a fresh sorted list of free exact-title IDs without mutation. Unknown title gives [].

**Final:** `new Library(copies)` copies `[copyId,title]` pairs; IDs unique nonempty, titles/member IDs nonempty. `borrow(memberId,title)` chooses smallest free copy ID or null; duplicate member/title raises even if exhausted. `returnCopy(copyId,memberId)` releases the owner's loan (true), returns false if unloaned/unknown, raises RangeError for wrong owner. `available(title)` is a fresh sorted ID list. `loans()` returns fresh `{copyId,title,memberId}` objects sorted by copy ID. Empty catalog valid; no due dates/editing.

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
