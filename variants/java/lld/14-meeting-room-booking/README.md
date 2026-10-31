# Meeting Room Booking System — Java

## Ownership and transitions

Half-open intervals overlap exactly when a.start < b.end and b.start < a.end; equality at an endpoint permits adjacency. Plan all requested rooms before committing any reservation. A successful booking ID remains reserved after cancellation, while a failed ID can be retried. Sorting feasible rooms by capacity/ID gives deterministic allocation. A scan-based catalog uses O(rooms * bookings) checks plus candidate sorting.

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

Half-open reservations permit endpoint adjacency but reject any shared interior time. The predicate works for containment and partial overlap alike:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        long leftStart = 0, leftEnd = 2;
        long rightStart = 2, rightEnd = 4;
        boolean overlap = leftStart < rightEnd && rightStart < leftEnd;
        assert !overlap;
        assert leftEnd == rightStart;
    }
}
```

Using <= in either comparison would reject touching bookings incorrectly. For multiple rooms, compute the entire feasible allocation before adding any room reservation; one missing room must not leave a partial booking.

## Design boundary

A successful booking ID remains reserved after cancellation, while a capacity failure leaves the ID reusable. Each room independently must satisfy seats; capacities are not summed across rooms. This abstract-time model intentionally has no wall-clock cleanup or recurrence policy.

## Practice

**Prototype:** RoomCalendar.reserve(start,end) requires start>=0 and end>start; overlapping requests return false unchanged, touching intervals accepted. slots returns fresh start/end-sorted Interval values.

**Final:** MeetingRoomBooking copies a room-ID -> positive capacity map (nonempty IDs, empty catalog valid). book validates nonempty ID, valid nonnegative interval, seats>=1 and roomCount>=1 before duplicate checks; each chosen room independently holds seats. Choose exactly roomCount free rooms by capacity then ID, returning IDs in that order, or null atomically. Successful IDs are reserved forever. cancel releases all active rooms once; allocation returns a fresh original list or null. schedule rejects unknown room and returns active Reservation records sorted start/end/ID. No clock/cleanup.

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
