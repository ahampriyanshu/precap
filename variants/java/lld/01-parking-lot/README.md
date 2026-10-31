# Parking Lot — Java

## Ownership and transitions

Allocation policy and reservation are separate responsibilities. Rank compatibility by size, then choose the smallest compatible free kind and identifier. A ticket is a stable release handle: a repeated release must not free a later occupant. Validate the whole inventory before reserving anything. A scan is O(spots) per arrival; ticket lookup/release is O(1) with a hash map (ordered snapshots may require sorting).

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

Compatibility is an ordered relation; a smaller kind may consume a larger kind, but the reverse is invalid. Keep that policy explicit rather than depending on inventory insertion order:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        Map<String, Integer> rank = Map.of("motorcycle", 0, "car", 1, "van", 2);
        assert rank.get("car") <= rank.get("van");
        assert !(rank.get("van") <= rank.get("car"));
        long oldTicketId = 7, laterTicketId = 8;
        assert oldTicketId != laterTicketId;
    }
}
```

The compatibility check is separate from reservation. Releasing through a lifetime ticket ID prevents an old handle from targeting a later allocation of the same physical spot.

## Design boundary

A full lot is a normal capacity failure, while an invalid kind or duplicate active vehicle is a request error. Neither may consume the next ticket number. This model assumes serialized calls; concurrent gates would need synchronization around selection plus commit, and physical occupancy would need its own source of truth.

## Practice

**Prototype:** `chooseSpot(List<Spot>, String vehicleKind)` returns a spot ID or null. Kinds are exactly motorcycle/car/van in that size order; identifiers are nonempty and inventory IDs unique. Validate every spot, preserve input, then select smallest compatible kind and ID.

**Final:** `ParkingLot(List<Spot>)` owns copied inventory. `park(vehicleId,kind)` returns Ticket or null for capacity failure; duplicate active vehicles raise. IDs start at 1 and advance only on success. `release(ticketId)` returns the released Ticket or null once absent. `activeTickets()` is ticket-ID ordered; `availableSpots()` is kind-rank/ID ordered. Releasing permits that vehicle to park again.

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
