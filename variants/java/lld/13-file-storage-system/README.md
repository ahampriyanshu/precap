# File Storage System — Java

## Ownership and transitions

Quota is derived accounting owned by the catalog, never a caller-editable counter. Copy charges size again and preserves absolute expiry; resetting TTL would extend lifetime incorrectly. Only explicit advanceTo expires entries, at expiresAt <= now, and each removal releases bytes once. Hash lookups are expected O(1); expiry scans O(files), search sorting O(matches log matches).

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

A copy inherits absolute expiration, not a fresh relative lifetime. Otherwise copying just before expiry would extend retention unexpectedly:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        long createdAt = 0, ttl = 5, copyTime = 2;
        long sourceExpiry = createdAt + ttl;
        long preservedExpiry = sourceExpiry;
        long wronglyResetExpiry = copyTime + ttl;
        assert preservedExpiry == 5;
        assert wronglyResetExpiry == 7;
    }
}
```

Both source and copy expire at 5, and both charge their own size until removed. Deleting one must not release the other bytes; repeated deletion must release nothing further.

## Design boundary

Only advanceTo moves logical time, so passive get/search calls cannot unexpectedly change quota availability. The model stores metadata, not file bytes, and assumes serialized operations. Durable object storage, checksums, multipart uploads, and concurrent quota enforcement are separate concerns.

## Practice

**Prototype:** FileCatalog.upload requires nonempty name and nonnegative size; duplicate returns false preserving old size. get returns Long/null; zero-byte files valid.

**Final:** FileStorage starts at time 0, nonnegative quota and usage 0. Only advanceTo changes time, requiring monotonic nonnegative timestamps and expiring all exact-boundary entries. upload(name,size,ttl) validates nonempty name, size >=0, ttl null or >0 before capacity/duplicate checks; expiry is current time+ttl. copy(source,destination) validates nonempty destination first, fails unchanged for missing/existing/over-quota, and retains source absolute expiry. delete releases once. get returns immutable StoredFile or null. search(prefix,limit) returns fresh snapshots sorted size descending/name, negative limit raises, zero returns empty. Expired names may be reused.

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
