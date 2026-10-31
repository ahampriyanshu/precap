# Binary search on the answer — Java

## Problem and baseline

Find a minimum capacity while retaining input order and allowing at most a fixed number of contiguous groups. The answer space can be much larger than the number of weights.

Testing every integer capacity is correct but scales with the numeric answer range. Binary search needs a monotone feasibility predicate: once a capacity can complete the ordered partition, every larger capacity can too.

## A focused Java step

Midpoint arithmetic should not overflow even when both bounds are individually valid:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        long low = Long.MAX_VALUE - 10;
        long high = Long.MAX_VALUE - 2;
        long middle = low + (high - low) / 2;
        assert middle == Long.MAX_VALUE - 6;
        assert low <= middle && middle <= high;
    }
}
```

Adding the bounds before dividing can overflow. This safe midpoint is useful only after the feasibility invariant establishes what each bound means. Validate positive weights and days before evaluating that predicate.

## Where the idea is useful

Binary search on a monotone answer appears in capacity planning, batching limits, and minimum feasible thresholds. It depends on a proof of monotonicity; a plausible-looking numeric parameter alone is not sufficient.

## Mechanism

The greedy feasibility scan fills the current group until the next weight would exceed capacity. If capacity works, every larger capacity works too. Binary search the first feasible capacity between the largest weight and the total, computing mid as low+(high-low)/2. Final O(n log(sum-max+1)) time and O(1) workspace.

## Java representation

Return the smallest capacity dividing positive weights in their original order into at most days nonempty contiguous groups. Extra days may remain unused. Empty weights return zero for positive days. Reject days <= 0 or any weight <= 0.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(long[] weights, int days)` returning `long` with a direct baseline.

**Final:** implement `solve(long[] weights, int days)` with the mechanism and bounds described above. Return the smallest capacity dividing positive weights in their original order into at most days nonempty contiguous groups. Extra days may remain unused. Empty weights return zero for positive days. Reject days <= 0 or any weight <= 0. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
