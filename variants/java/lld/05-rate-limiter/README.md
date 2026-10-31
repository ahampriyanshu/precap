# Rate Limiter — Java

## Ownership and transitions

The active interval is (now-window,now], so exactly the left boundary expires. Accepted history and observed time are separate: a denial adds no accepted event but still prevents later time regression for that client. Per-client state avoids coupling unrelated clocks. A deque can remove each accepted timestamp once; retained state scales with accepted events in active windows.

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

The left edge is excluded from a sliding window. Accepted history can remain unchanged even while the observed request time advances:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        long now = 5, window = 3;
        List<Long> recent = List.of(2L, 3L, 5L);
        boolean boundaryActive = recent.get(0) > now - window;
        assert !boundaryActive;
        assert recent.get(1) > now - window;
    }
}
```

Timestamp 2 expires exactly at now=5. Denials do not append timestamps, but must still advance the per-client clock so a later backward request is rejected.

## Design boundary

Caller-supplied logical time makes boundary behavior deterministic without clocks or sleeps. A production distributed limiter would additionally need a shared authority and atomic decisions; independent in-memory instances do not enforce a common quota.

## Practice

**Prototype:** `allowRequest(recent,limit,window,now)` validates positive limit/window, nonnegative now, and nondecreasing nonnegative history no later than now. Filter timestamps strictly greater than now-window; append now only if active size < limit. Return Decision(allowed,newHistory). Retain all active history even if already over limit; do not mutate input.

**Final:** `SlidingWindowLimiter` applies that rule per nonempty client ID. `allow` rejects backward per-client calls (including after denial), and accepted/denied valid calls update that client's observed time. Different clients have independent time. `history` returns a new retained list without expiring or advancing time.

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
