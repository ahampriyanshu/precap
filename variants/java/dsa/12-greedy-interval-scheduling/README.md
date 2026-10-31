# Greedy interval scheduling — Java

## Problem and baseline

Select compatible half-open intervals with a deterministic earliest-finish optimum. Selection order must account for end time, start time, and identifier ties.

Choosing earliest start or shortest duration can block a larger compatible collection. Exploring all subsets can establish correctness for small inputs, but the exchange argument behind earliest finish avoids that exponential search.

## A focused Java step

Touching half-open intervals are compatible; the overlap predicate makes the boundary explicit:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        long firstStart = 0, firstEnd = 2;
        long secondStart = 2, secondEnd = 4;
        boolean overlap = firstStart < secondEnd && secondStart < firstEnd;
        assert !overlap;
        assert secondStart >= firstEnd;
    }
}
```

Replacing a strict comparison with <= would reject adjacent intervals incorrectly. The final canonical sort must also break equal-end ties by start and ID, so independent implementations agree on the selected sequence.

## Where the idea is useful

Interval scheduling is useful for maximizing count under exclusive-resource time constraints. It solves that specific objective; adding weights, multiple rooms, or setup costs can invalidate the same greedy rule.

## Mechanism

An earliest-ending compatible interval leaves at least as much room for later choices as any competing first interval. Sorting by end/start/id makes the optimum canonical. Touching half-open intervals are compatible. Prototype may enumerate subsets; final sorting plus greedy scan costs O(n log n) time and O(n) copied storage.

## Java representation

Require unique job IDs and end > start, otherwise `IllegalArgumentException`. Return IDs selected after sorting by `(end,start,id)` and accepting each start >= the preceding selected end. Empty input returns empty. Example `(b,0,2),(a,0,2),(c,2,3)` selects a,c.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(List<Job> jobs)` returning `List<String>` with a direct baseline.

**Final:** implement `solve(List<Job> jobs)` with the mechanism and bounds described above. Require unique job IDs and end > start, otherwise `IllegalArgumentException`. Return IDs selected after sorting by `(end,start,id)` and accepting each start >= the preceding selected end. Empty input returns empty. Example `(b,0,2),(a,0,2),(c,2,3)` selects a,c. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
