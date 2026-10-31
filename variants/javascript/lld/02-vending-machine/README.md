# Vending Machine — JavaScript

## Ownership and transitions

A purchase changes stock and credit together. Check item existence, stock, and payment before applying either mutation. Refund captures then clears credit, preventing double refunds. A catalog snapshot must copy each nested item, not only its outer object. Expected selection cost is O(1); an inventory snapshot costs O(products).

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

**Prototype:** `changeDue(price,paid)` requires nonnegative safe integers and paid>=price; return paid-price or raise RangeError.

**Final:** `new VendingMachine(products)` copies `[code,price,stock]` tuples with unique nonempty codes, positive price, and nonnegative stock. Empty inventory valid. `insert(amount)` requires positive integer, accumulates/returns credit. `balance()` reads credit. `select(code)` returns `{code,change}`, decrements stock once, and clears credit; unknown code, sold out, or insufficient credit raises RangeError unchanged. `refund()` returns/clears credit and repeats as zero. `inventory()` returns a fresh plain object keyed by code, with fresh `{price,stock}` values. No restock.

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
