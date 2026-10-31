# Banking System — Java

## Ownership and transitions

A transfer commits two balances, one outgoing total, and one successful replay record together. Store the successful result rather than recomputing it on retry: later deposits must not change a retry's return value. Failures consume no request ID. A fingerprint distinguishes exact retries from conflicts. Point operations are expected O(1), ranking O(A log A), replay retention O(R).

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

A successful replay returns its original result rather than recalculating with current balances. Result values and live account state are different records:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        record Result(long source, long target) {}
        Result original = new Result(70, 30);
        long currentSource = 79;
        assert original.source() == 70;
        assert currentSource != original.source();
    }
}
```

A deposit after the first transfer can change the live balance without changing what an exact retry must return. The request fingerprint must also remain immutable so conflicting reuse is rejected.

## Design boundary

The atomic boundary includes source debit, target credit, spending total, and replay installation. Failed transfers reserve no request ID. Durable financial accounting would require a ledger and crash-recovery guarantees; a serialized in-memory model cannot promise either.

## Practice

**Prototype:** BalanceAccount starts at zero; positive deposits return balance, positive withdrawals return false if unaffordable, otherwise debit once and return true. Invalid amounts raise unchanged.

**Final:** Bank has `createAccount`, nullable `balance`, and `deposit` (validate positive amount before missing-account result). `transfer(requestId,source,target,amount)` validates positive amount first; exact successful retry returns its original TransferResult, conflicting successful ID raises. Missing/same accounts or insufficient funds return null; failures reserve no ID. Success moves money and adds amount only to source outgoing. `topSpenders(limit)` includes zero spenders, ordered outgoing descending then ID; negative limit raises, zero gives empty.

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
