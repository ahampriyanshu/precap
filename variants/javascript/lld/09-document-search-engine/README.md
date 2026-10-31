# Document Search Engine — JavaScript

## Ownership and transitions

A positional index supports exact phrase matching by aligned token positions. Replacing text must remove old term counts and positions before the new index becomes visible, or stale matches survive. Count overlapping phrase starts; a repeated-token phrase can match at adjacent positions. Ranking sorts score descending then document ID. Index construction costs input length, while phrase verification and ranking depend on candidate matches.

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

**Prototype:** tokenize(text) returns lowercase ASCII `[a-z0-9]+` runs in order with duplicates, using whole-string JavaScript toLowerCase then regex. Non-ASCII characters and punctuation separate runs; return a new list.

**Final:** SearchEngine accepts nonempty document IDs. add returns false on duplicate preserving text; get exact original text or null; update/delete return false when missing. search(term,limit=10) requires exactly one query token even when limit zero. searchPhrase(phrase,limit=10) matches consecutive tokens, counts overlapping starts, and returns [] for no query tokens. Both return fresh `[docId,score]` pairs ordered score descending then ID, at most limit. Negative/noninteger limits raise RangeError. stats returns `[documentCount,totalTokenCount]`, counting empty documents. Updates/deletion/reuse leave no stale matches or counts.

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
