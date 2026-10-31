# Library Management System — Java

## Ownership and transitions

Title identity and physical copy identity are distinct. A loan owns one copy and member; duplicate-title validation must run before capacity failure so an exhausted title does not hide a member's duplicate request. Release checks ownership before changing availability. A small scan costs O(copies); maps keep direct loan access cheap.

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

A title can have several physical copies, while one member may hold only one active copy of that exact title:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        record Loan(String copyId, String title, String memberId) {}
        List<Loan> loans = List.of(new Loan("copy-1", "Title", "member"));
        boolean alreadyHeld = loans.stream().anyMatch(loan ->
            loan.memberId().equals("member") && loan.title().equals("Title"));
        assert alreadyHeld;
        assert !loans.get(0).copyId().equals("copy-2");
    }
}
```

Checking only copy identity would allow duplicate-title loans for one member. Checking only title identity would incorrectly prevent a different member from borrowing another copy.

## Design boundary

Loan ownership is authoritative; outward records cannot change it. Validate duplicate member/title before checking free capacity so exhaustion does not alter error precedence. Due dates, reservations, and catalog editing introduce new policies and are outside this contract.

## Practice

**Prototype:** `availableCopies(List<CopyState>,title)` filters available exact-title copies and returns sorted IDs; assume valid inputs, preserve them.

**Final:** `Library(List<BookCopy>)` validates unique nonempty IDs and nonempty titles. All method IDs/titles are nonempty. `borrow(memberId,title)` returns the smallest free copy ID or null, and rejects a duplicate active title for that member. `returnCopy(copyId,memberId)` returns false if absent, raises for wrong owner, otherwise releases once. `available(title)` and `loans()` return fresh sorted snapshots (copy-ID order).

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
