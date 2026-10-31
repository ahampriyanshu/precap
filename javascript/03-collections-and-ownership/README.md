# Collections, identity, and ownership

Arrays represent ordered sequences; objects represent property bags; Maps and Sets provide explicit key/value and membership collections. Choosing a collection establishes identity, ordering, and mutation behavior as well as complexity. Many JavaScript production bugs come from sharing a reference that was assumed to be a snapshot.

## Choose keys and order deliberately

Object property keys are strings or symbols. Map accepts arbitrary values as keys and preserves insertion order. Objects used as Map keys compare by identity. Set provides unique membership with the same value-equality family; it does not deeply compare records.

```javascript
const map = new Map();
map.set({id: "a"}, 1);
console.log(map.get({id: "a"})); // undefined: different object
console.log(new Set([NaN, NaN]).size); // 1
```

Use a stable primitive ID when records arriving from different requests represent the same entity. Object enumeration also treats integer-like property names differently from other strings. If insertion order is a contract, a Map makes it clearer; sort explicitly when a canonical order is required.

## An array's shape affects behavior

An empty slot differs from an element containing undefined. Some array operations skip holes, and JSON serialization can hide that distinction. Numeric sorting needs a comparator, while mutating methods change the original array.

```javascript
const values = [10, 2, 1];
console.log([...values].sort((a,b) => a-b)); // copy, numeric order
console.log(values);                       // original unchanged
```

Use dense arrays for ordinary application data. A queue implemented with repeated shift operations may repeatedly move elements; a head index or dedicated deque expresses that access pattern better. Avoid claiming constant-time behavior for every array operation.

## Copying one layer preserves deeper aliases

Spread syntax copies enumerable own properties into a new outer object. It does not recursively copy nested arrays, preserve all descriptors, or establish a general immutable data model.

```javascript
const original = {id: "a", tags: ["urgent"]};
const shallow = {...original};
shallow.tags.push("review");
console.log(original.tags.length); // 2
```

Choose ownership at the API boundary. A service can return a deliberately detached projection, an immutable value, or a documented shared reference. structuredClone supports many structured values and cycles, but rejects functions and has its own type/prototype semantics. JSON round-tripping has a different supported-type set and can silently change data.

## Repeated operations expose accidental shared state

Factories should create independent collections. Caching a mutable result can let one caller corrupt later callers. A defensive copy on input protects against later external edits; a copy on output protects internal state from the reader. Both can be necessary, and copying cost should match the actual isolation requirement.

Map and Set remain strong references to their contents. Clearing a UI view does not free records retained by a global cache. Put a capacity, invalidation rule, and lifecycle owner on long-lived collections. When a lookup needs stable IDs, do not solve accidental aliasing by serializing entire objects into undocumented keys.

## Practice

Rows have `{id: string, tags: string[]}`. IDs are nonempty and unique where required; inputs in this exercise otherwise follow that shape.

Prototype: `copyRows(rows)` returns fresh row objects with fresh tag arrays, preserving order and duplicates in tags. Input and output mutations must be independent.

Final: `indexById(rows)` returns a Map from ID to an owned row snapshot, in input insertion order. Reject duplicate or empty IDs with RangeError and preserve all inputs, including on rejection. Each call creates an independent result.

Complete the exported stubs in `exercise.mjs`. The prototype and final stages have separate checks.

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Use Node.js 20+ locally, or the website's browser worker. Tests are standard-library only and check the documented behavior; they do not prove performance or force garbage collection.
