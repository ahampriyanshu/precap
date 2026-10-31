# Segment trees — Java

## Problem and baseline

Process point replacements and half-open range minima, returning absence for empty ranges. Increasing the old minimum must change every affected ancestor summary.

Copy-and-scan repeats range work. A segment tree combines child summaries, but an update that only compares the old parent with the replacement cannot remove a stale smaller value.

## A focused Java step

An ancestor must be rebuilt from its current children after replacement, rather than retaining its old minimum:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        long oldParent = 1;
        long newLeft = 9, unchangedRight = 5;
        long stale = Math.min(oldParent, newLeft);
        long repaired = Math.min(newLeft, unchangedRight);
        assert stale == 1;
        assert repaired == 5;
    }
}
```

The stale value no longer exists in either child. A complete implementation needs interval-aware queries and an explicit empty identity; using a numeric default for empty ranges would conflate absence with a valid minimum.

## Where the idea is useful

Segment trees support mutable interval summaries when the combine operation is associative. Choose the stored summary and empty identity carefully; extending to range updates requires additional lazy-propagation invariants.

## Mechanism

A segment tree combines interval minima. Point replacement requires recomputing ancestors from both children; merely taking min(old,new) leaves stale minima after an increase. Null is the identity for an empty query and must be handled explicitly. Final O(n) construction/space and O(log n) updates/queries.

## Java representation

`Update("set", index, value)` replaces an internal value; `Update("min", left, right)` queries [left,right). Return only query minima in order and null for empty ranges. Reject unknown operations, invalid set indices, and ranges unless 0 <= left <= right <= n. Negative values are valid.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(long[] temps, List<Update> commands)` returning `List<Long>` with a direct baseline.

**Final:** implement `solve(long[] temps, List<Update> commands)` with the mechanism and bounds described above. `Update("set", index, value)` replaces an internal value; `Update("min", left, right)` queries [left,right). Return only query minima in order and null for empty ranges. Reject unknown operations, invalid set indices, and ranges unless 0 <= left <= right <= n. Negative values are valid. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
