# Expense Sharing System — Java

## Ownership and transitions

Integer cents make conservation exact. Split quotient plus remainder in sorted participant order rather than rounding fractions. Net balances remain zero-sum after an expense and after settlement. Canonicalize participant membership before storing an idempotency fingerprint; exact retries must be checked before balance-dependent settlement checks. Suggestions work on copies and claim deterministic pairing, not a minimum transfer count.

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

Remainder cents are assigned deterministically rather than rounded. The integer quotient and remainder together preserve the total:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        long total = 5, count = 3;
        long base = total / count, remainder = total % count;
        assert base == 1 && remainder == 2;
        assert 2 + 2 + 1 == total;
        assert 2 - 1 - 1 == 0; // each net transition remains zero-sum
    }
}
```

The first two sorted participants receive the extra cent. Canonical participant membership also makes a reordered exact retry equivalent, without applying the expense twice.

## Design boundary

Expenses and settlements share one operation-ID namespace. Recognize exact settlement replay before balance-dependent checks because the first accepted payment changed those balances. Suggestions operate on copies and promise deterministic pairing, not a globally minimal number of transfers.

## Practice

**Prototype:** splitEqual(total,participants) requires total>=0 and distinct nonempty names in a nonempty list; return lexically sorted Map<String,Long> shares. Divide equally, giving the first total%count sorted names one extra cent. Preserve input.

**Final:** ExpenseSharing copies fixed valid members and starts all at zero. addExpense requires nonempty operation ID, positive total, group payer, and distinct nonempty participant subset; payer may be excluded. Credit payer total and debit shares. settle requires two distinct members and positive amount bounded by debtor debt and creditor credit. Both methods validate structure, then recognize exact prior success (false) or conflicting ID/method (raise), then apply balance checks. Failures consume no ID. Participant order is ignored for expense identity. balances is fresh lexical map including zero values, positive means owed. suggestSettlements greedily pairs alphabetic debtors/creditors on copies with minimum current amount, omits zeros, returns Settlement values without applying them.

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
