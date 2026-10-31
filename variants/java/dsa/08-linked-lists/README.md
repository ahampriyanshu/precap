# Linked lists and node identity — Java

## Problem and baseline

Filter blocked values while also practicing removal from an actual linked structure. Equal node values do not make their node objects interchangeable: surviving identity is part of the contract.

Building a fresh list of values is a good prototype but cannot satisfy pointer identity. Removing only one matching node fails on adjacent removals; changing a local head variable without returning it loses head updates.

## A focused Java step

Two objects can have equal payloads and different identities. Java reference comparison is the relevant operation for the pointer tests:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        final class Node {
            final long value;
            Node(long value) { this.value = value; }
        }
        Node first = new Node(7);
        Node second = new Node(7);
        assert first.value == second.value;
        assert first != second;
    }
}
```

The final implementation must return those same surviving references in order, rather than replacements holding equal numbers. A sentinel may simplify link ownership at the head, but its own reference must not appear as a surviving node.

## Where the idea is useful

Identity-preserving removal matters when other indexes, iterators, or owners retain references to nodes. A value-only output hides aliasing errors that an object-oriented interface must make explicit.

## Mechanism

Value filtering and pointer surgery have different ownership contracts. A value result may allocate new values; detach must retain every surviving Node object. A sentinel removes the head special case, while a previous-survivor pointer ensures adjacent blocked nodes are all skipped. Final filtering and detachment target expected O(n+b) time.

## Java representation

`prototype` and `solve` return surviving values in order, omitting all blocked values without changing either array. Also implement `detach(Node head, Set<Long> blocked)` in both stages: relink existing nodes, preserve survivor identity/order, do not mutate blocked, and terminate without a cycle. Null or complete removal returns null. Temporary sentinels are allowed.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(long[] values, long[] blocked)` returning `List<Long>` with a direct baseline.

**Final:** implement `solve(long[] values, long[] blocked)` with the mechanism and bounds described above. `prototype` and `solve` return surviving values in order, omitting all blocked values without changing either array. Also implement `detach(Node head, Set<Long> blocked)` in both stages: relink existing nodes, preserve survivor identity/order, do not mutate blocked, and terminate without a cycle. Null or complete removal returns null. Temporary sentinels are allowed. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
