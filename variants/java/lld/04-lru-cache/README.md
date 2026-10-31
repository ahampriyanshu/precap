# LRU Cache — Java

## Ownership and transitions

Recency belongs to successful reads and writes, not missing reads. LinkedHashMap in access-order mode combines lookup with ordering; an explicit linked list plus map is another design. Updating a key changes its value and position without increasing entry count. Expected O(1) get/put/delete, O(n) snapshots.

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

Insertion order and access order differ. Java supplies an access-ordered LinkedHashMap, while snapshots must remain separate from that live container:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        var entries = new LinkedHashMap<String, Long>(16, 0.75f, true);
        entries.put("a", 1L);
        entries.put("b", 2L);
        entries.get("a");
        assert new ArrayList<>(entries.keySet()).equals(List.of("b", "a"));
    }
}
```

The successful read refreshes a to the newest position without changing size. A cache miss must not refresh an unrelated key, and updating one key must not create a second entry for it.

## Design boundary

Capacity zero remains a valid object whose puts validate then retain nothing. The returned fallback object on a miss is passed through by identity, whereas item snapshots own their outward list. Thread safety would require protecting lookup and recency changes together, not merely swapping in a concurrent map.

## Practice

**Prototype:** `touchOrder(keys,key)` returns a new oldest-to-newest list with key appearing once at the end. Inputs are distinct nonempty keys.

**Final:** `LRUCache(int capacity)` requires capacity >= 0; keys are nonempty, values long (negative allowed). `put` inserts/updates, refreshes recency, and evicts oldest if needed; zero capacity makes valid puts no-ops. `get(key,fallback)` returns Long and refreshes a hit, or the exact fallback object on miss without recency change. `delete` is idempotent. `items()` returns Entry records oldest first.

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
