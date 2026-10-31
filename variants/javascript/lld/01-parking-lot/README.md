# Parking Lot — JavaScript

## Ownership and transitions

Compatibility and reservation are separate responsibilities. Rank kinds by size, then select the smallest compatible kind and ID to avoid wasting a larger resource. Ticket IDs identify ownership across release/reallocation; a repeated old release cannot free a newer occupant. Validate every inventory record before the instance becomes usable. A scan costs O(spots) per arrival; map lookup makes release expected O(1).

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

**Prototype:** `chooseSpot(spots,vehicleKind)` takes `[spotId,kind]` pairs, all free, and returns an ID or null. Kinds are exactly motorcycle/car/van in increasing size; IDs are nonempty and unique. Validate the entire input, including unselectable spots, then choose smallest compatible kind/ID. Preserve input.

**Final:** `new ParkingLot(spots)` copies the same validated inventory, including empty. `park(vehicleId,kind)` returns `{ticketId,vehicleId,vehicleKind,spotId}` or null if no capacity. Duplicate active vehicle raises RangeError. Ticket IDs start 1 and advance only on success. `release(ticketId)` requires a safe integer and returns released snapshot or null once absent. `activeTickets()` is ticket-ID ordered; `availableSpots()` returns kind/ID ordered pairs. Releasing permits that vehicle to park again.

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
