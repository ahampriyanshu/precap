# Interfaces, inheritance, and composition

## Substitute behavior without inheriting storage

An interface names a capability. Its callers should depend on observable behavior rather than a concrete class's fields. Java supports one class superclass and multiple interfaces; interface default methods supply behavior, but conflicting defaults require an explicit resolution. Overriding methods may narrow a return type, but cannot reduce visibility or add broader checked exceptions. Use @Override so the compiler checks that a method truly overrides rather than accidentally overloads.

Inheritance creates a substitution obligation: code accepting the base type must still behave correctly with a subtype. A subtype that rejects an operation the base contract permits weakens that guarantee. Constructor calls to overridable methods can observe uninitialized subclass state. Inherit when the relationship and protected extension points are stable; compose collaborators when behavior should vary independently.

```java
interface Formatter { String format(String value); }
record PrefixFormatter(String prefix) implements Formatter {
    public String format(String value) { return prefix + value; }
}
Formatter formatter = new PrefixFormatter(">");
assert formatter.format("x").equals(">x");
```

## Composition defines order and ownership

A pipeline keeps the order of its operations explicit. Applying trim before length validation differs from validating before trim. Capturing a caller's mutable list means later edits can unexpectedly change the pipeline; snapshot the collaborator list when building it. The collaborators themselves are references, so if an operation owns mutable state, copying the list does not clone that state.

A lambda implementing a functional interface can defer work until a later call. Building a pipeline should not execute it. Let exceptions propagate from the operation that fails, and avoid invoking later operations after that failure. A useful interface exposes the smallest behavior its callers need; a broad service interface often couples unrelated responsibilities. This exercise uses a functional contract, but the same substitution and ownership decisions apply to classes implementing ordinary interfaces.

## Practice

The supplied `Transform` functional interface has `String apply(String value)`; inputs/results are nonnull unless a transform deliberately throws.

**Prototype:** `applyAll(String input,List<Transform>) -> String` applies transforms once each in list order. Empty list returns original input. Propagate an exception unchanged and stop before later transforms; preserve list.

**Final:** `pipeline(List<Transform>) -> Transform` returns deferred composition with the same application contract. Construction invokes nothing and snapshots the transform list, so caller list changes do not alter behavior. Repeated calls run the pipeline independently; transform objects themselves are intentionally shared.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
