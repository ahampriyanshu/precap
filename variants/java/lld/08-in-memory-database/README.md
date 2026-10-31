# In-Memory Database — Java

## Ownership and transitions

Version selection precedes expiration testing. Choose the latest processed version at or before the requested time, then evaluate that version alone; an expired replacement cannot resurrect an older value. Deletion appends a tombstone. Equal timestamps select the last processed write. Append is amortized O(1), history lookup can use binary search O(log H), and scans visit known fields and sort names.

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

First choose the latest version, then evaluate its lifetime. Expiration must not search backward for an older replacement:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        record Version(long writtenAt, String value, Long expiresAt) {}
        Version older = new Version(2, "old", null);
        Version latest = new Version(5, "new", 8L);
        long queryTime = 8;
        boolean visible = latest.expiresAt() == null || queryTime < latest.expiresAt();
        assert !visible;
        assert older.value().equals("old");
    }
}
```

The older value still exists as history, but the correct current answer is absence. A tombstone has the same no-fallback effect. Equal-timestamp history lookup must choose the last processed version.

## Design boundary

Validate TTL and lookback before advancing accepted time; otherwise a rejected future request can accidentally prohibit later valid calls. Retention policies in a real temporal store must preserve versions needed by promised historical reads, even after their current values expire.

## Practice

**Prototype:** RecordStore stores string fields by record key; empty strings are valid. `set/get/scan(key,prefix)` overwrite, return null when absent, and return fresh name-sorted Field records.

**Final:** TemporalDatabase methods take nonnegative nondecreasing ts; every valid read or failed conditional advances time, equal times allowed. `set(ts,key,field,value,ttl)` uses null for no TTL; positive TTL gives visibility [ts,ts+ttl). `delete` appends absence only for a visible field. `compareAndSet` writes only on matching visible expected string and replaces lifetime. `getAt(ts,key,field,at)` requires 0 <= at <= ts and reads already processed history. TTL/lookback validation precedes time changes. `scan(ts,key,prefix)` returns visible sorted Field records. Invalid calls preserve accepted time/history.

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
