# Prim minimum spanning trees — Java

## Problem and baseline

Find an undirected MST directly from a dense symmetric matrix. Null is no edge; zero and negative costs are real usable edges, and diagonal values do not connect new vertices.

Converting every matrix entry to an edge list duplicates dense representation work. Prim can retain one best crossing cost per unvisited vertex, selecting and updating that compact frontier row by row.

## A focused Java step

Absence must not be represented by zero because zero can be the cheapest valid connection:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        Long absent = null;
        Long freeConnection = 0L;
        Long negativeConnection = -2L;
        assert absent == null;
        assert freeConnection != null;
        assert negativeConnection < freeConnection;
    }
}
```

A minimum frontier value that is absent indicates disconnection, while zero must be accepted normally. Shape and symmetry validation happen before ignoring diagonal entries, so malformed matrices cannot slip through an early empty/singleton answer.

## Where the idea is useful

Array-frontier Prim is a useful dense-graph counterpart to sorting sparse edges. O(V²) matrix access and O(V) auxiliary frontier space avoid a large heap or extra edge-list copy.

## Mechanism

Dense Prim stores the cheapest crossing edge for each unvisited vertex. Each iteration selects the minimum frontier cost, then relaxes that vertex's entire row. An unreachable minimum means disconnection. Negative and zero weights remain valid; null is absence, so a numeric sentinel must not conflate them. Final O(V²) time and O(V) space.

## Java representation

Require a square, symmetric Long matrix (null means no edge), otherwise `IllegalArgumentException`. Validate symmetry before ignoring diagonal values. Return the minimum spanning-tree total or null if disconnected. Empty matrix returns 0L. Prototype may convert to an edge list and apply an MST algorithm.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(Long[][] costs)` returning `Long` with a direct baseline.

**Final:** implement `solve(Long[][] costs)` with the mechanism and bounds described above. Require a square, symmetric Long matrix (null means no edge), otherwise `IllegalArgumentException`. Validate symmetry before ignoring diagonal values. Return the minimum spanning-tree total or null if disconnected. Empty matrix returns 0L. Prototype may convert to an edge list and apply an MST algorithm. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
