# Banking System — JavaScript

## Ownership and transitions

A successful transfer commits both balances, the outgoing total, and the replay record as one transition. Store its original returned balances; recomputing a retry from later live balances breaks idempotency. Failed requests reserve no ID, and a conflicting accepted ID must not overwrite its replay record. Point operations are expected O(1); ranking all accounts costs O(A log A), and retained replay entries consume O(requests).

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

**Prototype:** BalanceAccount starts at zero; `balance`, positive `deposit` returning balance, positive `withdraw` returning bool. Unaffordable withdrawal returns false; invalid amount raises unchanged.

**Final:** Bank.createAccount(nonemptyId) returns false on duplicate without resetting. balance returns number/null; deposit validates positive safe integer before missing-account result. transfer(requestId,source,target,amount) validates positive amount first; exact successful retry returns original `[sourceBalance,targetBalance]`, conflict raises RangeError. Otherwise missing/same accounts or insufficient funds return null unchanged. Success moves amount and adds only to source outgoing. Failures reserve no ID. topSpenders(limit) returns fresh `[id,outgoing]` pairs ordered outgoing descending/ID, includes zero spenders; zero gives [], negative/invalid limit raises.

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
