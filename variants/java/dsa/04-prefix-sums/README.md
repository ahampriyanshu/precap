# Prefix sums — Java

## Problem and baseline

Answer many half-open range sums over one unchanged sequence. Query boundaries are positions between elements; [i,i) is valid and has sum zero.

Summing each range independently costs work proportional to all requested lengths. Preprocessing should instead store one cumulative boundary value per position. Omitting the leading zero creates unnecessary special cases at the beginning.

## A focused Java step

The cancellation identity can be inspected independently of table construction:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        long[] prefix = {0, 4, 2, 9}; // boundaries for [4, -2, 7]
        int left = 1, right = 3;
        assert prefix[right] - prefix[left] == 5;
        assert prefix[2] - prefix[2] == 0;
        assert prefix.length == 4;
    }
}
```

The leading zero represents the empty prefix. Subtracting boundary totals removes exactly the elements before left. Negative input values do not invalidate this identity; monotonicity of totals is not needed. Validation must check every boundary before using it.

## Where the idea is useful

Prefix aggregates fit repeated analytics queries over immutable snapshots. When updates arrive between queries, the prefix table becomes stale and an update-aware structure such as a Fenwick tree may be appropriate.

## Mechanism

A prefix table stores the sum before each index. For a half-open range, subtracting the prefix at left from the prefix at right cancels exactly the preceding elements. The extra leading zero removes the left=0 special case. Prototype scans each range; final O(n+q) time and O(n) space.

## Java representation

Return sums for `[left,right)` in query order. Negative values and empty ranges are valid; empty sums are zero. Reject any range unless `0 <= left <= right <= values.length`, preserving both inputs even when a later query is invalid.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(long[] values, List<Range> queries)` returning `List<Long>` with a direct baseline.

**Final:** implement `solve(long[] values, List<Range> queries)` with the mechanism and bounds described above. Return sums for `[left,right)` in query order. Negative values and empty ranges are valid; empty sums are zero. Reject any range unless `0 <= left <= right <= values.length`, preserving both inputs even when a later query is invalid. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
