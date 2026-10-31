# Floyd–Warshall all-pairs shortest paths — Java

## Problem and baseline

Compute cheapest routes for every ordered vertex pair, including parallel edges and negative costs. Any negative cycle anywhere invalidates the full matrix contract.

Running a single-source method from every vertex is a useful baseline. Floyd–Warshall instead extends the set of allowed intermediate vertices in a fixed outer-loop order; arbitrary loop interchange loses that meaning.

## A focused Java step

One cell update compares its existing route with a route through a specific allowed intermediate:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        Long direct = 9L;
        Long toIntermediate = 3L;
        Long fromIntermediate = 2L;
        long through = toIntermediate + fromIntermediate;
        assert through < direct;
        assert through == 5;
    }
}
```

This arithmetic is valid only when both route halves are reachable. The full recurrence must preserve the intermediate-vertex invariant, keep the cheapest parallel edge, and inspect negative diagonal entries after relaxation.

## Where the idea is useful

All-pairs distances suit dense small graphs and repeated pair queries. O(V²) retained output and O(V³) processing become expensive quickly, so sparse or one-source workloads may need another approach.

## Mechanism

The intermediate-vertex loop must be outermost: after k, each cell is optimal using only allowed intermediates through k. Guard unreachable operands before addition. Keep the cheapest parallel edge and zero diagonal; a negative diagonal after relaxation detects a negative cycle anywhere. Final O(V³) time, O(V²) space.

## Java representation

Return an n-by-n Long distance matrix with null for unreachable pairs. Directed edges may be negative. n=0 returns empty. Reject negative n, invalid endpoints, or any negative cycle. Prototype may run Bellman–Ford from each source.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(int n, List<Edge> edges)` returning `List<List<Long>>` with a direct baseline.

**Final:** implement `solve(int n, List<Edge> edges)` with the mechanism and bounds described above. Return an n-by-n Long distance matrix with null for unreachable pairs. Directed edges may be negative. n=0 returns empty. Reject negative n, invalid endpoints, or any negative cycle. Prototype may run Bellman–Ford from each source. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
