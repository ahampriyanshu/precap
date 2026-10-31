# Stacks and nested operations

A stack represents operations that have opened but have not yet closed. Last-in-first-out ordering means the next close must match the most recently opened label. Merely checking whether the label occurs anywhere among open operations accepts invalid nesting.

For LOAD:a, LOAD:b, UNLOAD:a, the a exists but b is still on top. The sequence must fail at that unload. A simple prototype can cancel adjacent matching pairs; the final stack records the same nesting state directly.

## State and reasoning

Process one token at a time and distinguish malformed input from valid syntax with invalid order. Each reached token requires one colon, an exact command name, and a nonempty label. Then a load pushes its label; an unload must match the top before removing it. End-of-input succeeds only when no unmatched loads remain.

Failure order is part of the API. After an unload ordering violation, return false immediately, without validating a later token. Thus `["UNLOAD:x", "bad"]` returns false, while a reached `"LOAD:"` throws. A prototype that globally parses all tokens first would change this observable contract.

JavaScript arrays support push/pop at the end without shifting an entire prefix. Return actual boolean true/false, rather than a remaining length or an object that happens to be truthy.

```javascript
const pending = ["a", "b"];
console.log(pending.at(-1)); // b: only this label may close next
pending.pop();
console.log(pending); // ["a"]
```

## Cost and use

The stack costs O(n) token operations plus parsing time proportional to token text, and O(d) pending labels for maximum nesting depth d. Adjacent reduction can revisit many positions and be quadratic. This mechanism applies to nested scopes and undo lifecycles when closures must match openings; it does not model operations that can finish out of order.

## Practice

Implement `prototype(tokens)` and `solve(tokens)`. Each reached token must be exactly `LOAD:<nonempty-label>` or `UNLOAD:<nonempty-label>` with exactly one colon. A malformed reached token throws RangeError.

Return whether the whole sequence is valid LIFO order; `[]` returns true and unmatched loads at the end return false. Return false at the first ordering violation without inspecting later tokens: `["UNLOAD:x", "bad"]` returns false. A reached `"LOAD:"` throws RangeError.

Prototype: adjacent-pair reduction preserving that processing rule. Final: a stack. Preserve the token array on success and failure.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
