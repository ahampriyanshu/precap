# Task Scheduler — JavaScript

## Ownership and transitions

Priority dispatch and lease ownership are separate state machines. Expiry makes a task pending at the exact boundary; reassignment receives a fresh token, so an older completion cannot finish the new lease. Timed failures still expire old leases and advance accepted time. Invalid lease duration must be rejected before time advances. Scan-based dispatch/expiry costs O(tasks) plus priority sorting; heaps need stale-entry handling.

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

**Prototype:** PriorityQueue.add(name,priority) returns increasing numeric IDs starting 1; pop removes highest priority then lowest numeric ID as `[id,name]` or null. Names may be empty/duplicates; priority any safe integer. IDs never reused.

**Final:** TaskScheduler.addTask uses same order/IDs. addWorker(workerId,capacity) requires positive integer capacity before duplicate check, preserving original quota. dispatch(ts,workerId,lease) requires positive lease, expires old leases, then returns best Task snapshot or null for unknown/full/no pending. Successful globally increasing lease tokens start 1; failures consume none. complete(ts,taskId,token) returns true only for exact active unexpired lease and marks done. getTask/active also expire first; active returns fresh ID-sorted snapshots. Task keys exactly `{id,name,priority,status,worker,expiresAt,token}`; assignment fields null for pending/done. All timed calls accept nonnegative nondecreasing integer ts; valid failures advance time, invalid calls preserve it. Expiry is expiresAt<=ts. IDs/tokens accepted by public methods must be safe integers. Worker IDs are strings, including empty.

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
