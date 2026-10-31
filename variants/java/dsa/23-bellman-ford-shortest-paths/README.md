# Bellman–Ford shortest paths — Java

## Problem and baseline

Compute directed shortest costs with negative edges and reject only negative cycles reachable from the chosen source. An unreachable cycle cannot influence any source route.

Simple-path enumeration is expensive and separately detecting cycles complicates a baseline. Repeated relaxation shares improvements across routes. The extra pass is meaningful only when a candidate starts from a reachable vertex.

## A focused Java step

Null reachability must guard relaxation before numeric addition:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        Long fromDistance = null;
        long edgeWeight = -4;
        boolean canRelax = fromDistance != null;
        assert !canRelax;
        fromDistance = 3L;
        assert fromDistance + edgeWeight == -1;
    }
}
```

An unreachable endpoint has no numeric cost to extend; treating absence as zero invents routes into disconnected components. After V-1 full passes, a further reachable improvement demonstrates a negative cycle rather than a merely late ordinary path.

## Where the idea is useful

Bellman–Ford is useful when negative costs are legitimate and reachable-cycle detection matters. Its O(VE) bound is higher than Dijkstra, so the extra generality should match the actual edge-cost contract.

## Mechanism

Each relaxation extends a known route by one edge. Without a reachable negative cycle, a shortest simple path has at most V-1 edges. An improvement on a further full pass proves a source-reachable negative cycle. Do not relax from unreachable distance. Final O(VE) time and O(V) distance storage.

## Java representation

Directed weights may be negative. Return Long minimum costs and null for unreachable vertices. Reject n <= 0, invalid source/endpoints, or a source-reachable negative cycle. An unreachable negative cycle must not raise.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(int n, List<Edge> edges, int source)` returning `List<Long>` with a direct baseline.

**Final:** implement `solve(int n, List<Edge> edges, int source)` with the mechanism and bounds described above. Directed weights may be negative. Return Long minimum costs and null for unreachable vertices. Reject n <= 0, invalid source/endpoints, or a source-reachable negative cycle. An unreachable negative cycle must not raise. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
