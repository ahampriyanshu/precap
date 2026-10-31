# Linked lists and node identity

An array filter preserves values and order by building a new array. A linked-list operation can have a stronger contract: preserve the actual surviving node objects. Reconstructing equivalent nodes produces the right printed values but fails identity checks held by other callers.

JavaScript objects have reference identity. Two `new Node(3)` objects are different even though both contain 3. Use strict equality to reason about which node survives.

## State and reasoning

Each node contains a value and a next reference. To remove it, change the incoming link to its successor rather than allocating a replacement survivor. Removing the head needs special treatment or a temporary sentinel whose next points at the old head. That sentinel may be new; the result's surviving nodes may not be.

A previous-survivor pointer must advance only when the current node survives. Advancing it across a removed node can strand the retained chain. Preserve original survivor order and terminate the result at null; accidentally pointing backward creates a cycle.

Convert blocked values into a Set for membership checks without changing the caller's array or Set. Garbage collection reclaims unreachable removed nodes, but it does not fix incorrect links or preserve identity for reconstructed nodes. Outside references may keep removed nodes alive; their existence is independent of whether the result includes them.

```javascript
import { Node } from "./exercise.mjs";
const original = new Node(3);
const alias = original;
const replacement = new Node(3);
console.log(alias === original, replacement === original); // true false
```

## Cost and use

Filtering with repeated blocked-array searches costs O(n b). A blocked Set permits expected O(n+b) time. Relinking needs constant pointer state beyond the membership set; returned arrays require their own output space. Linked lists are useful when stable node identity or local link changes matter, but array locality often wins for ordinary scans.

## Practice

Implement `prototype(values, blocked)` and `solve(values, blocked)`. Both return a new array of surviving Number values in original order, excluding every value present in the blocked array. `[1, 2, 3, 2, 4]` blocked by `[1, 2]` returns `[3, 4]`. Empty arrays are valid. Preserve both arrays.

Also implement `detach(head, blocked)` using the supplied Node class; head is Node or null and blocked is a Set of Numbers. Relink existing nodes only. Every surviving object must retain its identity and order, and the result must be acyclic and end at null. Null input or complete removal returns null. A temporary sentinel is allowed; do not mutate blocked. Identity checks run in **both** stages.

Prototype: filter values into a new array. Final: complete the linked-list operation as well as the values API. Link mutation is allowed inside detach; replacement survivor allocations are not.

All numeric inputs and finite arithmetic results in this lesson are safe-integer Numbers. Use `null` for documented absence, not `undefined` or a numeric sentinel. Return actual booleans where the contract requires them. Do not add validation requirements beyond the documented inputs.


Run with Node.js 20+ from this directory:

```sh
node main.mjs --stage prototype
node main.mjs --stage final
```

Edit `exercise.mjs`; keep `main.mjs` unchanged. Both stages begin as unfinished learner functions. The website uses the same test functions in a separate browser worker. Tests check deterministic examples, boundaries, documented validation, input preservation, and stage-specific cases. Passing tests does not prove the required time complexity.
