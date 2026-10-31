# Topological sorting — Java

## Problem and baseline

Order directed prerequisites, choose the smallest legal next vertex, and detect any cycle. Repeated edges denote one dependency rather than several independent prerequisites.

Testing permutations gives a small baseline but factorial work. A plain FIFO zero-indegree frontier may produce a valid order without producing the lexicographically smallest one. Deduplicate before counting indegrees.

## A focused Java step

The legal frontier needs a minimum-first policy, independent of the order vertices became available:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        PriorityQueue<Integer> legal = new PriorityQueue<>();
        legal.add(4);
        legal.add(1);
        legal.add(3);
        assert legal.remove() == 1;
        assert legal.remove() == 3;
    }
}
```

The smallest available vertex is emitted first. The complete algorithm still has to decrement neighbors exactly once per distinct edge, add newly legal vertices, and require a full n-vertex result rather than returning a partial prefix through a cycle.

## Where the idea is useful

Topological order supports build plans, prerequisite scheduling, and dependency validation. A cycle is a domain failure to order, rather than a reason to arbitrarily omit the remaining vertices.

## Mechanism

Indegree counts unfinished prerequisites. The legal frontier contains only zero-indegree vertices; a min-heap chooses the smallest available vertex to obtain the lexicographically smallest full order. Deduplicate edges before counting. Fewer emitted vertices than n means a cycle. Final O((V+E) log V) time and O(V+E) space.

## Java representation

Directed (u,v) means u before v. Return the lexicographically smallest valid vertex order or null for any cycle. Duplicate edges count once. n=0 returns empty. Negative n or invalid endpoints raise `IllegalArgumentException`. Prototype may test permutations.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(int n, List<Link> edges)` returning `List<Integer>` with a direct baseline.

**Final:** implement `solve(int n, List<Link> edges)` with the mechanism and bounds described above. Directed (u,v) means u before v. Return the lexicographically smallest valid vertex order or null for any cycle. Duplicate edges count once. n=0 returns empty. Negative n or invalid endpoints raise `IllegalArgumentException`. Prototype may test permutations. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
