# Message Broker — Java

## Ownership and transitions

One retained message log can serve many independent consumer-group cursors. Delivery attempt and in-flight state differ: repeated poll returns the same attempt; nack clears in-flight ownership and only redelivery increments. Acknowledgment may advance only the exact current delivery. Final nack appends once to that group's DLQ. Log operations are amortized O(1); retention grows with published messages and group failures.

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

An in-flight delivery and a retryable rejected delivery are different states, even while the group stays at the same log position:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        int position = 0, attempt = 1;
        boolean inFlight = true;
        inFlight = false; // a retryable nack clears only delivery ownership
        assert position == 0;
        assert attempt == 1;
        assert !inFlight;
    }
}
```

Another poll at that position creates attempt 2. A repeated poll while inFlight was true would instead repeat attempt 1. Acknowledgment between nack and redelivery must fail because no delivery is currently owned.

## Design boundary

The retained log is shared, but cursors, attempts, in-flight state, and DLQs belong to each group. This makes one group failure independent of another progress. There is no timeout or automatic retry clock; adding one would require new delivery-ownership rules.

## Practice

**Prototype:** MessageQueue publishes each lifetime ID once (even after consumption); consume removes oldest Message or returns null. Empty IDs/payloads are valid.

**Final:** MessageBroker(maxAttempts) requires >=1. Retain immutable messages in FIFO order; duplicate publish preserves payload. subscribe starts at the oldest log entry and duplicate subscribe preserves progress. poll returns Delivery(id,payload,attempt), repeats an in-flight attempt unchanged, and increments only on redelivery after retry. ack accepts only matching current in-flight ID and advances/reset attempts. nack returns null for invalid, retry below limit without advancing, or dead-letter at limit and appends DeadLetter(id,payload,attempts) then advances. Groups are independent; unknown polls are null, unknown DLQs empty. deadLetters is a fresh nondraining list.

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
