# Sorting and two pointers — Java

## Problem and baseline

Find a canonical value pair using two distinct input positions. The returned values are ordered, and when several pairs work the smallest first value wins.

All-pairs enumeration is straightforward but quadratic. Sorting a copy makes it possible to reject an entire group of pairs after one comparison. Sorting the original violates input ownership and may erase position information needed by other APIs.

## A focused Java step

A copied primitive array isolates sorting from the caller while retaining duplicates as distinct positions:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        long[] original = {5, 1, 5};
        long[] ordered = original.clone();
        Arrays.sort(ordered);
        assert Arrays.equals(original, new long[]{5, 1, 5});
        assert ordered[1] == 5 && ordered[2] == 5;
        assert ordered.length == 3;
    }
}
```

Two equal values can still form a pair because they occupy different positions. A set-based simplification would lose that multiplicity. The pointer loop must use left < right so one position cannot be paired with itself.

## Where the idea is useful

Sort-and-discard arguments are useful for sum constraints, deduplication, and joining ordered value streams. The important step is proving which pointer move cannot discard a better valid answer.

## Mechanism

Sorting a copy makes the sum monotone in either pointer. If the sum is too small, moving the right pointer cannot help; advance the left pointer. The first successful left value is the smallest feasible first component. Use distinct positions even for equal values. Final O(n log n) time, O(n) copied storage.

## Java representation

Return the lexicographically smallest ascending value `Pair(a,b)` with `a+b == target` using distinct positions, or null. Negative values and duplicates are valid. `[5]` cannot pair with itself; `[5,5]` can.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(long[] weights, long target)` returning `Pair` with a direct baseline.

**Final:** implement `solve(long[] weights, long target)` with the mechanism and bounds described above. Return the lexicographically smallest ascending value `Pair(a,b)` with `a+b == target` using distinct positions, or null. Negative values and duplicates are valid. `[5]` cannot pair with itself; `[5,5]` can. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
