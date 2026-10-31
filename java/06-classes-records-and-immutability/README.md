# Classes, records, and immutability

## Constructors establish usable objects

A class groups state with the operations that preserve its invariants. Keep mutable fields private, validate before assigning them, and avoid leaking this from a constructor before initialization finishes. A static field belongs to the class, so using it for per-instance mutable storage accidentally couples independent objects. A final field prevents reassignment after construction; it does not stop mutation of a collection stored inside it.

Records provide component accessors, a canonical constructor, equals/hashCode, and toString for transparent data carriers. They are final and cannot extend another class, though they can implement interfaces. A record with a List component still holds a mutable list unless the constructor or factory takes a defensive snapshot. Its generated equality compares components, so array components compare identities rather than array contents.

```java
record Labels(List<String> values) {}
var source = new ArrayList<>(List.of("a"));
var labels = new Labels(source);
source.clear();
assert labels.values().isEmpty();
```

## An immutable boundary needs both directions

Copy inputs you retain, and do not hand out an internal mutable collection. A fresh mutable copy allows caller editing without affecting the owner; an unmodifiable snapshot expresses a read-only value. Collections.unmodifiableList wraps a live backing list unless you copied that backing list first. List.copyOf makes a shallow snapshot and rejects null elements. Deep copying is required only for mutable elements that remain shared; immutable strings may be shared safely.

```java
var source = new ArrayList<>(List.of("a"));
List<String> frozen = List.copyOf(source);
source.clear();
assert frozen.equals(List.of("a"));
```

Immutability simplifies hashing, sharing across threads, and reasoning about a snapshot's lifetime. It does not make an entire mutable service atomic. Prefer an ordinary class when identity and controlled state transitions are central, and a record when the public meaning is its component values. Avoid exposing internal data merely because generated accessors are convenient.

## Practice

**Prototype:** `copyTags(List<String>) -> List<String>` returns a fresh mutable copy preserving exact order and duplicates. Mutating either copy afterwards must not affect the other; strings are nonnull.

**Final:** `freeze(String name,List<String> tags) -> Snapshot` requires nonnull nonempty name (IllegalArgumentException otherwise), preserves tag order/duplicates, and retains a detached unmodifiable list. Snapshot's generated accessors/equality are used directly. Mutation of source after return must not affect snapshot; tag mutation through the accessor must throw UnsupportedOperationException. Empty tags valid; null tags/elements outside domain.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
