# Message Broker — JavaScript

## Ownership and transitions

A retained FIFO log is shared content; each consumer group owns its cursor, in-flight flag, attempt, and dead letters. Repeated polling returns the same attempt, while a retry rejection clears ownership and increments only on redelivery. An acknowledgment advances only a matching current in-flight ID. At the attempt limit append once to that group DLQ and continue. Retention grows with messages and group failures; no timeout is implicit.

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

**Prototype:** MessageQueue.publish(messageId,payload) returns true once per lifetime ID, including IDs already consumed. consume destructively returns oldest `{id,payload}` or null. Empty IDs/payloads valid; no replacement.

**Final:** MessageBroker(maxAttempts=2) requires positive safe integer, counting initial delivery. publish retains lifetime-unique immutable messages. subscribe(groupId) creates progress from oldest message, duplicate false preserving position. poll returns `{id,payload,attempt}`, null for unknown/caught-up, and repeats current attempt without increment. ack accepts only current matching in-flight delivery, returns bool, advances/reset attempt. nack returns null if invalid, retry below limit without advancing, or dead-letter at limit and appends `{id,payload,attempts}` to that group then advances. Ack/nack between rejection and redelivery is invalid. deadLetters returns fresh nondraining nested snapshots or [] for unknown. Groups are independent; empty string group IDs valid. No wall clock, timeout, or deletion.

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
