# Binary trees and level-order traversal — Java

## Problem and baseline

Group a binary tree by depth, preserving structural left-to-right order. A list traversal order is not enough unless the result also retains the boundary between levels.

Rescanning once per depth repeats visits, especially on a long chain. A queue keeps one frontier; capturing its size before processing prevents newly appended children from being consumed in the same level.

## A focused Java step

A fixed frontier size remains meaningful even as the queue grows with the next depth:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        Deque<String> queue = new ArrayDeque<>(List.of("left", "right"));
        int levelSize = queue.size();
        queue.addLast("left.child");
        assert levelSize == 2;
        assert queue.size() == 3;
    }
}
```

The current level still contains two nodes. Iterating until the queue becomes empty would merge all later depths into the same output level. ArrayDeque rejects null, so child checks belong before enqueueing.

## Where the idea is useful

Frontier processing supports level summaries, tree visualization, and breadth-limited exploration. Space tracks maximum frontier width; a deep narrow tree can use little queue space even with many total nodes.

## Mechanism

A queue separates frontier order from recursion depth. Capture the current queue size before visiting a level; adding children while iterating that fixed count preserves level boundaries and left-to-right order. Null children must not enter ArrayDeque. Final O(n) time and O(w) frontier space, excluding output.

## Java representation

Input is null or a finite tree of immutable Tree records with unique names and no shared children. Return one fresh list per depth, in structural left-to-right order. Null input returns an empty list.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(Tree tree)` returning `List<List<String>>` with a direct baseline.

**Final:** implement `solve(Tree tree)` with the mechanism and bounds described above. Input is null or a finite tree of immutable Tree records with unique names and no shared children. Return one fresh list per depth, in structural left-to-right order. Null input returns an empty list. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
