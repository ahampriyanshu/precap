# Expense Sharing System — JavaScript

## Ownership and transitions

Integer cents preserve conservation exactly. Divide by participant count and distribute remainder cents to the first sorted names; floating-point rounding can invent or lose cents. Store a canonical operation fingerprint so participant order does not affect expense retries. Exact settlement replay precedes balance checks because the first success changed those balances. Suggestions pair alphabetic debtors/creditors on copies, with deterministic output and no minimum-transfer claim.

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

**Prototype:** splitEqual(total,participants) requires nonnegative safe integer total and distinct nonempty names in a nonempty list. Preserve input; return plain object shares constructed in lexical name order, quotient plus one extra cent for first remainder names. Zero shares valid. Integer-index property names follow JavaScript enumeration rules even though remainder allocation uses lexical order.

**Final:** ExpenseSharing(members) copies valid fixed members with zero balances. addExpense(operationId,payer,total,participants) requires nonempty ID, positive total, group payer, and distinct nonempty participant subset; payer may be excluded. Credit payer total, debit shares. settle(operationId,debtor,creditor,amount) requires nonempty ID, two distinct members, positive amount, and sufficient debtor debt/creditor credit. Both validate structure first, then exact successful retry returns false before balance-dependent checks; any accepted ID reused with different data/method raises RangeError. Expense identity ignores participant order. Failures consume no ID. balances returns fresh plain object of every member, positive means owed; sum always zero, keys constructed lexically subject JS enumeration rules. suggestSettlements returns fresh `[debtor,creditor,cents]` pairs by alphabetic debtor/creditor greedy matching on copies, no mutations.

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
