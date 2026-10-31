# Objects, prototypes, and classes

JavaScript's object model is prototype-based. An object can delegate missing property lookup to another object. Classes provide a structured syntax for constructors, methods, inheritance, and private fields over that model. Understanding the mechanism helps distinguish shared behavior from accidentally shared mutable state.

## Own properties and delegated behavior

Property lookup first checks the object and can then walk its prototype chain. An own property can shadow an inherited one. Object.hasOwn answers a different question from the in operator, which also sees inherited properties. A getter can execute code, so reading an arbitrary property is not always a passive data operation.

```javascript
const defaults = {retries: 2};
const config = Object.create(defaults);
console.log(config.retries, Object.hasOwn(config, "retries")); // 2, false
```

Use explicit projections when converting trusted domain objects to data contracts. Object spread copies enumerable own values; it does not preserve accessor descriptors or a prototype. JSON is a data format with an even narrower representation, not an object-cloning protocol.

## A class separates per-instance data from shared methods

Methods normally live on the prototype; instance fields are initialized for each object. Private fields use a class-specific access mechanism rather than a naming convention. A property beginning with underscore remains public.

```javascript
class Label {
  #value;
  constructor(value) { this.#value = value; }
  read() { return this.#value; }
}
console.log(new Label("ready").read()); // ready
```

A method called with an incompatible receiver can fail its private-field access. An extracted method also loses the intended receiver unless bound or called through its owner. Use static methods for behavior belonging to the class interface rather than one instance, and avoid mutable static state unless its shared lifetime is intended.

## Inheritance extends a contract

A derived constructor must establish the base instance through super before using this. Calling an overridable method from a base constructor is risky because the derived state may not yet exist. Field initialization order matters when a subclass depends on base behavior.

An override should preserve the promises users rely on: accepted inputs, result meaning, state invariants, and error behavior. Extending an object just to reuse a few lines can couple unrelated lifecycles. Composition often provides a clearer boundary: pass a formatter, storage client, or policy object rather than inherit all of its implementation.

## Snapshots and mutations need explicit ownership

A snapshot should contain the representation promised to its caller and should not expose internal mutable references. A version counter should advance when an accepted domain change occurs, not whenever a method happens to run. Rejected or repeated no-op updates should leave both state and version unchanged if that is the contract.

For collaboration, an in-memory version number alone does not coordinate multiple processes. A server still needs authoritative compare-and-set or a transaction. Here the value is learning how classes protect a local invariant; production persistence introduces another boundary.

## Practice

Prototype: implement class `Document(id, title)` with `setTitle(title)` and `snapshot()`. id is a nonempty string; title is a string (including empty). Invalid values throw RangeError. setTitle returns true only when the title changes. snapshot returns a new `{id, title}` object; callers cannot change internal state through it.

Final: implement `VersionedDocument extends Document`. Start at version 1. Inherit the same validation and update behavior; increment version once per accepted title change, never on a no-op or rejection. snapshot returns a new `{id, title, version}` object. Instances are independent.

Complete the exported stubs in `exercise.mjs`. The prototype and final stages have separate checks.

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Use Node.js 20+ locally, or the website's browser worker. Tests are standard-library only and check the documented behavior; they do not prove performance or force garbage collection.
