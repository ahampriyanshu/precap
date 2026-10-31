# Recipe Manager — JavaScript

## Ownership and transitions

A revision is immutable historical content. Rollback appends a historical copy as a new latest version and never discards the audit trail. Current-name uniqueness changes when a recipe is renamed; historical names remain in older revisions but do not reserve a name. Explicit read/write permissions are independent. Copy input lists and every nested result list. A simple current-name/ingredient scan costs O(recipes); history snapshots cost returned content size.

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

**Prototype:** RecipeDraft(name,ingredients,steps) retains ordered list copies and snapshot returns `{name,ingredients,steps}` with fresh lists. Empty/duplicate items and empty name allowed; no permissions.

**Final:** RecipeManager.addUser(userId,permissions) requires nonempty ID, only read/write strings (duplicates harmless), validates even duplicate IDs, returns false preserving existing permissions. add(userId,name,ingredients,steps) requires write and nonempty current unique name; returns recipe1,recipe2,... on success, null on denial/collision; failures consume no ID. update appends even identical content and returns version, null for denied/missing/name conflict; renaming frees old current name. get(userId,id,version=null) requires read; null latest, nonexistent integer revision returns null. history returns detached revisions in order or []. rollback(userId,id,version) requires write, appends selected content as new version unless missing/name conflict, returning version/null. byIngredient requires read, matches current exact membership once per recipe, sorts ingredient-list length/name/ID. Snapshot keys exactly `{id,version,name,ingredients,steps}`. Noninteger revision arguments raise RangeError; empty names raise before permission checks.

Every class is exported by name from `exercise.mjs`. Keep instances independent. Unless explicitly documented otherwise, input values have the stated collection/string types and do not contain null elements. Invalid calls preserve state; validate before mutation. Return fresh mutable snapshots unless stated otherwise.

Run from this directory with Node.js 20 or newer:

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` as the executable specification. The runner also exports `runTests(exercise, stage)` for the browser workspace. Each named check returns a visible result; failures and empty suites exit nonzero in Node. The default stage is final. Both stages intentionally begin unfinished.
