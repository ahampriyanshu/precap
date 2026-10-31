# Arrays and linear scans — Java

## Problem and baseline

Compute both a total and the position of the first maximum without losing original array order. An empty input needs an absent index, while a zero-valued element still has a real position.

Two scans can compute the two summaries independently. Sorting is a poor baseline because it changes which position an answer refers to; copying and sorting also does unnecessary O(n log n) work. The useful improvement is one prefix invariant, rather than an extra data structure.

## A focused Java step

Choose the numeric representation before writing the scan. Widening only after an overflowing int expression does not repair that expression:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        int value = 2_000_000_000;
        long widenedFirst = (long) value + value;
        long widenedAfter = value + value;
        assert widenedFirst == 4_000_000_000L;
        assert widenedAfter != widenedFirst;
    }
}
```

The addition on widenedFirst is evaluated as long. The other addition wraps as int before assignment. In the exercise, the input is already long[], but accumulators and comparisons must preserve that width. The maximum-index invariant is separate from the total and must preserve ties.

## Where the idea is useful

Single-pass summaries appear in telemetry reduction, batch statistics, and validation pipelines. Their main benefit is bounded state and a clearly stated prefix invariant; they do not require materializing or reordering the input.

## Mechanism

An accumulator summarizes a prefix. After visiting index i, total covers exactly indices 0..i and the maximum index points to the first maximum in that prefix. Updating only on a strict increase preserves ties. A sort destroys original positions; two separate traversals are correct but unnecessary. Final target: O(n) time and O(1) auxiliary space.

## Java representation

Return `Scan(total, firstMaximumIndex)`. Loads are nonnegative. Empty input gives `Scan(0, null)`; `[8,2,8]` gives `Scan(18,0)`. Ties choose the first original index.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(long[] loads)` returning `Scan` with a direct baseline.

**Final:** implement `solve(long[] loads)` with the mechanism and bounds described above. Return `Scan(total, firstMaximumIndex)`. Loads are nonnegative. Empty input gives `Scan(0, null)`; `[8,2,8]` gives `Scan(18,0)`. Ties choose the first original index. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
