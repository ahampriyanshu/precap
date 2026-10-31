# Rate Limiter — JavaScript

## Ownership and transitions

The accepted interval is (now-window,now], so the exact left boundary expires. Accepted timestamps and observed time are distinct: denials record no accepted timestamp but still advance that client clock. Separate per-client clocks allow unrelated logical times. A deque can expire each timestamp once; retained history grows with accepted active events.

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

**Prototype:** `allowRequest(recent,limit,window,now)` validates positive integer settings, nonnegative now, and nondecreasing nonnegative accepted history no later than now. Duplicate timestamps valid. Return `{allowed,history}` filtering to strictly greater than now-window, then append now only if filtered size<limit. Preserve input; an overfull active history remains intact and denied.

**Final:** SlidingWindowLimiter applies that rule per nonempty client. `allow(clientId,now)` returns bool, rejects backward time including after denial, and preserves state on invalid calls. Different clients have independent clocks. `history(clientId)` returns a fresh retained list relative to last valid allow, without advancing/expiring; unseen valid client gives [].

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
