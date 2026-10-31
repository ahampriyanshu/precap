# Kruskal and disjoint sets — Java

## Problem and baseline

Build a canonical minimum spanning tree for an undirected graph, allowing negative costs and ignoring self-loops. A cheapest edge is useful only when it connects different components.

Sorting edges and checking connectivity by traversing accepted edges is a clear baseline. DSU stores component membership so cycle checks do not repeatedly search the growing tree. Normalize endpoint orientation before tie-breaking.

## A focused Java step

Normalization makes two orientations of the same undirected edge compare consistently:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        int from = 7, to = 2;
        int low = Math.min(from, to), high = Math.max(from, to);
        assert low == 2 && high == 7;
        assert low == Math.min(to, from);
        assert high == Math.max(to, from);
    }
}
```

Weight remains the primary ordering key, followed by these normalized endpoints. DSU roots represent connectivity, not accepted-edge output order. A result with fewer than n-1 accepted edges is disconnected, even if several cheap cycles were considered.

## Where the idea is useful

MST construction is useful for cheapest connectivity under an undirected cost model. It minimizes total connection cost, not source-to-vertex route distances; shortest-path and spanning-tree objectives differ.

## Mechanism

Kruskal selects the next cheapest edge that crosses components. DSU represents component identity, while path compression and union by rank reduce repeated connectivity checks. Normalize endpoints before sorting so orientation cannot alter the canonical answer. Final O(E log E) sorting plus near-linear DSU work and O(V+E) storage.

## Java representation

Undirected weights may be negative. Normalize edges to min/max endpoints, then process by weight/from/to, rejecting self-loops and cycles. Return Mst(totalCost, acceptedEdges) in acceptance order, or null when disconnected. Valid n=0/1 returns cost zero and empty edges. Reject negative n or invalid endpoints.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(int n, List<Edge> edges)` returning `Mst` with a direct baseline.

**Final:** implement `solve(int n, List<Edge> edges)` with the mechanism and bounds described above. Undirected weights may be negative. Normalize edges to min/max endpoints, then process by weight/from/to, rejecting self-loops and cycles. Return Mst(totalCost, acceptedEdges) in acceptance order, or null when disconnected. Valid n=0/1 returns cost zero and empty edges. Reject negative n or invalid endpoints. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
