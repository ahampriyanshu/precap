# Vending Machine — Java

## Ownership and transitions

A purchase is one state transition over stock and credit. Lookup and validate stock/payment before applying either decrement, so insufficient credit and sold-out selections preserve both. Refund captures then clears credit, making repeated refunds return zero. Selection is expected O(1); inventory snapshots copy O(products) entries.

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

Credit is retained on a failed sale. Plan the prospective charge only after both stock and affordability are known:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        long credit = 150, price = 100, stock = 0;
        boolean canPurchase = stock > 0 && credit >= price;
        assert !canPurchase;
        assert credit == 150;
        assert stock == 0;
    }
}
```

Computing a false eligibility result has not changed any money or inventory. Only the owning purchase transition may apply both changes after all conditions pass.

## Design boundary

One machine instance models one serialized credit session. A physical dispenser can fail after authorization, so production hardware would require a separate dispensing outcome and reconciliation. The exercise returns a change amount and does not model coin availability.

## Practice

**Prototype:** `changeDue(long price,long paid)` requires nonnegative values and paid >= price; return paid-price or raise.

**Final:** construct VendingMachine from unique nonempty product codes, positive prices, and nonnegative stocks. `insert` requires positive amount and returns accumulated credit. `select` returns Receipt(code,change), decrements stock, and clears credit; missing code raises NoSuchElementException, sold-out/underpaid raises IllegalArgumentException. `refund()` clears and returns credit. `inventory()` is a fresh map of immutable Item records. Empty inventory is valid; no restocking.

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
