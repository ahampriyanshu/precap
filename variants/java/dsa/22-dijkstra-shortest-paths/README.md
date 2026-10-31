# Dijkstra shortest paths — Java

## Problem and baseline

Find cheapest directed routes when all edge weights are nonnegative. A discovered vertex can still receive a cheaper route before its best frontier entry is settled.

A shortest-hop traversal ignores weights, and marking a vertex final on discovery can preserve an expensive early route. A priority queue holds tentative costs; stale earlier entries are harmless only when explicitly rejected.

## A focused Java step

A queued distance can become obsolete after another path improves the current best value:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        record Visit(int vertex, long distance) {}
        long[] best = {0, 2};
        Visit queuedEarlier = new Visit(1, 10);
        assert queuedEarlier.distance() != best[queuedEarlier.vertex()];
        assert best[1] == 2;
    }
}
```

The distance-10 entry must not expand vertex 1 again as if it were current. This stale check does not validate the nonnegative-weight assumption: even an unreachable negative edge must be rejected by this exercise contract.

## Where the idea is useful

Dijkstra fits nonnegative routing and cost frontiers where settling the cheapest candidate is safe. Negative edges break that settlement argument and require a different method, even without a negative cycle.

## Mechanism

Nonnegative weights make the cheapest frontier distance final when popped. A priority queue may retain an earlier, more expensive entry for the same vertex; discard it by comparing to the current best distance. Marking on discovery is incorrect. Final O((V+E) log(max(2,E))) time and O(V+E) space.

## Java representation

Directed weighted edges allow parallel edges, self-loops, and zero costs. Return minimum Long costs in vertex order and null for unreachable vertices. Reject n <= 0, invalid source/endpoints, and every negative edge weight, including unreachable ones.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(int n, List<Edge> edges, int source)` returning `List<Long>` with a direct baseline.

**Final:** implement `solve(int n, List<Edge> edges, int source)` with the mechanism and bounds described above. Directed weighted edges allow parallel edges, self-loops, and zero costs. Return minimum Long costs in vertex order and null for unreachable vertices. Reject n <= 0, invalid source/endpoints, and every negative edge weight, including unreachable ones. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
