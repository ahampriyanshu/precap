# Meeting Room Booking System — JavaScript

## Ownership and transitions

Half-open intervals overlap when a.start<b.end and b.start<a.end; touching endpoints are compatible. Multi-room allocation plans all candidates before committing any, so an insufficient-room failure reserves nothing. A successful booking ID stays reserved after cancellation, while failed IDs may be retried. Capacity/ID sorting makes allocation deterministic. Scan-based selection costs O(rooms*bookings) plus candidate sorting.

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

**Prototype:** RoomCalendar.reserve(start,end) requires safe integers start>=0 and end>start, returns false for any overlap and true for accepted half-open interval. slots returns fresh start/end-sorted `[start,end]` pairs.

**Final:** MeetingRoomBooking(rooms) copies plain `{roomId:capacity}` object; nonempty IDs/positive integer capacities, empty valid. book(bookingId,start,end,seats,roomCount=1) validates nonempty ID, interval, positive seats/count before duplicate checks. Each selected room independently holds seats. Choose exactly roomCount available rooms by capacity then ID, commit together, return IDs in selection order or null unchanged. Successful IDs stay reserved forever, including after cancel. cancel returns true once and frees all assignments. allocation returns fresh original IDs or null. schedule(roomId) rejects unknown room and returns fresh `{id,start,end,seats}` records sorted start/end/ID. No clock/cleanup/recurrence.

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
