# Modules and runtime data boundaries

Modules give a program explicit dependencies and separate scopes. ES modules arose to replace scripts that shared global names and depended on load order. They support static linking and tooling, but a module boundary does not validate runtime data or establish a security boundary.

## Imports are bindings in a dependency graph

A module is evaluated once per resolved module identity within its environment. Named imports observe exported live bindings rather than copied local variables. That does not make an arbitrary destructured property from an object live. Circular dependencies require care because a binding may be read before initialization.

```javascript
// counter.mjs
export let count = 0;
export function increment() { count += 1; }
// consumer.mjs imports { count, increment } from the same counter module.
```

This is a two-file integration sketch. Keep dependency direction simple and avoid top-level side effects that require every importer to know an initialization order. Dynamic import returns a promise for a module namespace; use it when loading is conditional or a code boundary is useful. It does not eliminate the downloaded module's execution cost.

## Runtime and tooling choose resolution rules

Browsers resolve module URLs and do not automatically implement a package manager's resolution policy. Node has its own package/module rules. A bundler can resolve and transform a dependency graph into deployable chunks. A path that works in a development tool therefore needs an intentional production build and asset contract.

Use .mjs for an unambiguous Node ES module in these exercises. Keep environment-specific capabilities behind interfaces: a browser worker has no DOM, while a Node process has APIs unavailable in browsers. An exported function can be portable even when its adapter is platform-specific.

## A JSON parser checks grammar

JSON.parse accepts valid JSON values, including arrays, primitives, and null. A configuration API expecting an object must check that shape separately. It should then validate allowed keys, value kinds, ranges, defaults, and compatibility. A JavaScript type assertion or destructuring expression performs none of those checks.

```javascript
const value = JSON.parse("null");
console.log(value === null); // valid JSON, not a settings object
```

Define unknown-key behavior deliberately. Silently accepting a misspelled option can leave a dangerous default active. Prototype-related property names also need attention when merging untrusted dictionaries into ordinary objects. Copy only fields belonging to the contract instead of spreading an unvalidated object throughout the application.

## Configuration has ownership and versioning

An override should change the fields it owns without mutating shared defaults. If nested options exist, define whether replacement or recursive merging is intended; neither is universally correct. A configuration snapshot should be stable for the operation using it, while reload has a separate lifecycle.

Version public data contracts independently of internal classes. Serialized values should contain the authorized representation, not every field on a domain object. Validate both first-party and third-party boundaries: a response from your own old deployment can still have a shape a newly released client no longer accepts.

## Practice

Settings contain exactly the keys `retries` and `timeoutMs`. retries is a nonnegative safe-integer Number; timeoutMs is a positive safe-integer Number.

Prototype: `parseSettings(json)` parses a JSON string, requires a non-null non-array object with exactly those two own keys, validates values, and returns a fresh `{retries, timeoutMs}` object. JSON syntax errors remain SyntaxError; shape/domain errors throw RangeError.

Final: `mergeSettings(defaults, overrides)` validates defaults as a complete settings object and overrides as a non-null non-array object containing any subset of the two keys. Reject unknown own keys, including prototype-related names, and invalid values with RangeError. Return a fresh complete object; preserve both inputs. No recursive merge or coercion.

Complete the exported stubs in `exercise.mjs`. The prototype and final stages have separate checks.

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Use Node.js 20+ locally, or the website's browser worker. Tests are standard-library only and check the documented behavior; they do not prove performance or force garbage collection.
