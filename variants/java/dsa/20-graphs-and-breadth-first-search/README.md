# Graphs and breadth-first search — Java

## Problem and baseline

Find minimum undirected hop distances from a source while retaining null for unreachable vertices. Parallel edges and self-loops must not cause repeated discovery or incorrect distances.

Enumerating simple paths repeats common prefixes. BFS explores a complete distance layer before the next; marking at enqueue time ensures each vertex is discovered once rather than queued by several parents.

## A focused Java step

Ownership of discovery belongs to enqueue, before another incoming edge is examined:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        Long[] distance = {0L, null};
        Deque<Integer> queue = new ArrayDeque<>();
        distance[1] = distance[0] + 1;
        queue.addLast(1);
        assert distance[1] != null;
        assert queue.size() == 1;
    }
}
```

A second edge to vertex 1 can now see it is already discovered. Marking only on removal allows duplicate queue entries. The final graph construction must add both directions for each undirected edge and validate every endpoint first.

## Where the idea is useful

BFS answers shortest-hop questions in unweighted networks, dependency neighborhoods, and reachability layers. Once edge costs differ, discovery order alone no longer guarantees cheapest total cost.

## Mechanism

BFS visits vertices in nondecreasing hop distance. Mark a vertex when enqueuing, preventing parallel edges from duplicating frontier work. Undirected input creates both adjacency directions. Final O(V+E) time and space; prototype may enumerate simple paths.

## Java representation

Vertices are 0..n-1. Return hop distances as Long values in vertex order, with source zero and unreachable null. Self-loops and parallel undirected edges are valid. Reject n <= 0, invalid source, or invalid endpoint.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(int n, List<Link> edges, int source)` returning `List<Long>` with a direct baseline.

**Final:** implement `solve(int n, List<Link> edges, int source)` with the mechanism and bounds described above. Vertices are 0..n-1. Return hop distances as Long values in vertex order, with source zero and unreachable null. Self-loops and parallel undirected edges are valid. Reject n <= 0, invalid source, or invalid endpoint. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
