# Transactional Key-Value Store — Java

## Ownership and transitions

An inner commit merges into its immediate parent, so the outer transaction can still roll back that committed child. A stack of full map copies makes these boundaries explicit; delta maps need tombstones to hide parent keys. Strings make a shallow map copy sufficient. Begin costs O(N) time/space; D full frames retain O(DN); point operations remain expected O(1).

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

An inner commit remains tentative relative to an outer transaction. Distinct frame ownership makes that nesting visible:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        Map<String, String> base = new HashMap<>(Map.of("mode", "base"));
        Map<String, String> outer = new HashMap<>(base);
        Map<String, String> inner = new HashMap<>(outer);
        inner.put("mode", "inner");
        outer = inner; // inner commit replaces only its immediate parent
        assert base.get("mode").equals("base");
        assert outer.get("mode").equals("inner");
    }
}
```

The base frame is unchanged, so discarding outer can still restore base. Assigning outer=base at begin would instead alias the same map and make rollback impossible.

## Design boundary

Copied complete views trade memory for simple semantics. A more compact overlay design must represent deletion explicitly; absence from an overlay cannot mean both inherit-parent and delete-parent. This single-session contract provides rollback boundaries, not isolation across concurrent sessions or disk durability.

## Practice

**Prototype:** KeyValueStore supports void `set`, nullable `get`, and boolean `delete`. Empty keys and values are valid; null values are outside the domain.

**Final:** TransactionalStore adds `begin`, `commit`, `rollback`, and `depth`, each returning current/new depth as int. Commit/rollback close exactly one frame; at depth zero they raise IllegalStateException unchanged. Reads use the innermost view; deletion must hide parents. `snapshot(prefix)` returns a new key-sorted map of visible matching keys, with empty prefix selecting all.

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
