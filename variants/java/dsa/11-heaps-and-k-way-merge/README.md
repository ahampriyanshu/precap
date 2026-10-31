# Heaps and k-way merge — Java

## Problem and baseline

Merge sorted feeds while preserving duplicate values and leaving every feed unchanged. The next globally smallest value must be one of the current feed heads.

Concatenating and sorting ignores useful order already present in each input. A heap frontier stores one active candidate per feed, so each emitted value reveals only one new candidate instead of rescanning all feeds.

## A focused Java step

A heap entry carries source coordinates, and an explicit comparator gives deterministic handling of equal values:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        record Cursor(long value, int feed, int offset) {}
        var frontier = new PriorityQueue<Cursor>(Comparator
            .comparingLong(Cursor::value).thenComparingInt(Cursor::feed));
        frontier.add(new Cursor(1, 2, 0));
        frontier.add(new Cursor(1, 0, 0));
        assert frontier.remove().feed() == 0;
        assert frontier.size() == 1;
    }
}
```

The two entries are both retained. The source coordinates identify which feed to advance after removing one entry. Tie-breaking is not permission to deduplicate equal values, and empty feeds still need inspection during initialization.

## Where the idea is useful

K-way merge is useful for merging sorted file runs, shard results, and ordered event feeds. Keep frontier size proportional to active sources rather than total output size.

## Mechanism

The heap contains one current candidate per active sorted feed. Removing the smallest candidate reveals exactly one replacement from its feed. A heap entry needs the value and source position; equal values must not lose multiplicity. Final O(k+N log(max(2,k))) time including inspecting all feeds, O(k) frontier plus output.

## Java representation

Every feed is sorted nondecreasingly. Return all values sorted with duplicates preserved. Empty feeds and empty outer input are valid. Never change an inner feed or the outer list; no sortedness validation is required.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(List<List<Long>> feeds)` returning `List<Long>` with a direct baseline.

**Final:** implement `solve(List<List<Long>> feeds)` with the mechanism and bounds described above. Every feed is sorted nondecreasingly. Return all values sorted with duplicates preserved. Empty feeds and empty outer input are valid. Never change an inner feed or the outer list; no sortedness validation is required. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
