# Sliding windows with counts — Java

## Problem and baseline

Find the longest contiguous range whose distinct-label count stays within a limit. Repeated occurrences of a label still occupy positions but contribute only one distinct key.

Enumerating ranges and rebuilding sets repeats work. A moving window can retain counts while advancing both boundaries. Removing one occurrence must not remove the label until its count reaches zero.

## A focused Java step

This single boundary update illustrates the difference between occurrence count and distinct count:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        Map<String, Integer> counts = new HashMap<>();
        counts.put("a", 2);
        counts.put("b", 1);
        counts.merge("a", -1, Integer::sum);
        assert counts.size() == 2;
        assert counts.get("a") == 1;
    }
}
```

The label a remains in the window after one occurrence leaves. Removing its map entry immediately would falsely claim the window has fewer distinct labels and could admit an invalid range. The complete exercise also needs the shrinking loop and best-length invariant.

## Where the idea is useful

This pattern supports bounded-diversity windows in event streams, text analysis, and grouped activity. It applies when feasibility can be restored by moving the left boundary forward; arbitrary window predicates may not have that property.

## Mechanism

A window map owns counts inside [left,right]. Removing a label decrements one occurrence; it removes the distinct entry only at zero. Shrink until the distinct bound holds before recording the length. Each element enters and leaves once: expected O(n) time and O(k) active counts.

## Java representation

Return the greatest contiguous length with at most limit distinct exact strings. Empty input and limit zero return zero. Negative limit raises `IllegalArgumentException`.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(List<String> labels, int limit)` returning `int` with a direct baseline.

**Final:** implement `solve(List<String> labels, int limit)` with the mechanism and bounds described above. Return the greatest contiguous length with at most limit distinct exact strings. Empty input and limit zero return zero. Negative limit raises `IllegalArgumentException`. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
