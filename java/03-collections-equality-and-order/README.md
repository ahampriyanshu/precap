# Collections, equality, and order

## Choose the semantics before the container

List preserves positions and duplicates. Set models uniqueness. Map associates one value with each key. ArrayList gives O(1) indexed reads and amortized append; removing from the middle shifts elements. ArrayDeque supports queue/stack ends without LinkedList's per-node allocation. HashMap/HashSet provide expected O(1) lookup, while TreeMap/TreeSet order by a comparator in O(log n). Hash iteration order is not a public contract.

`equals` must be reflexive, symmetric, transitive, and consistent. Equal objects must have equal hash codes; unequal objects may collide. A mutable field used by hashCode can strand a key after insertion because its bucket was chosen using an earlier value. Immutable records make good keys when all components have stable equality. Arrays in a record still compare by reference unless you design an alternative representation.

```java
record Coordinate(int x, int y) {}
var counts = new HashMap<Coordinate, Integer>();
counts.put(new Coordinate(1, 2), 3);
assert counts.get(new Coordinate(1, 2)) == 3;
```

## Ordering has its own equality rule

A comparator returning zero makes two keys equivalent to an ordered set/map even when equals disagrees. Include tie-breakers when every logical key must survive. Use `Integer.compare` or comparingLong rather than subtraction, which may overflow. String.compareTo orders UTF-16 units; a different Unicode ordering must be explicit.

```java
Comparator<String> order = Comparator.comparingInt(String::length)
                                     .thenComparing(Comparator.naturalOrder());
assert order.compare("ab", "cd") < 0;
```

Collection factories differ: List.of rejects null and is unmodifiable; Arrays.asList is fixed-size but permits set; an unmodifiable view can still reflect changes in its backing collection. List.copyOf creates an unmodifiable shallow snapshot. Iterating while structurally mutating a typical collection can fail fast, but ConcurrentModificationException is a diagnostic, not synchronization. Keep ownership boundaries explicit and sort output when deterministic order matters.

## Practice

The supplied immutable Key(namespace,name) uses exact string component equality; components are nonnull and may be empty.

**Prototype:** `distinctCount(List<Key>) -> int` counts logical distinct keys without input changes.

**Final:** `frequencies(List<Key>) -> Map<Key,Integer>` counts all occurrences and iterates keys in namespace then name String.compareTo order. Return a fresh map, preserving input; empty gives empty. Equal newly allocated records must merge; same name in different namespaces stays separate.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
