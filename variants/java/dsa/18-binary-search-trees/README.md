# Binary search trees — Java

## Problem and baseline

Maintain an ordered set through insertion, removal, membership, and floor queries. The Boolean/Long/null result union must distinguish a failed mutation from a missing floor value.

An unsorted unique-key list makes updates simple but ordered queries require a scan. A BST uses subtree ordering to discard impossible keys. Deleting a two-child node must reconnect its replacement without losing the remaining subtree.

## A focused Java step

A floor search can retain an existing candidate while choosing which ordered region still contains a better answer:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        long rootKey = 5, query = 7;
        Long candidate = null;
        if (rootKey <= query) candidate = rootKey;
        assert candidate == 5L;
        assert query > rootKey; // a better floor, if present, must be to the right
    }
}
```

This is one search decision, not the complete traversal. If the root exceeded the query, its entire right subtree would be impossible. A hand-built unbalanced BST has O(height) operations and can degenerate to a chain; sorted input exposes that limit.

## Where the idea is useful

Ordered-set operations support predecessor lookups, range boundaries, and indexes. Use a balanced library tree in ordinary application code when custom node manipulation is not the purpose of the exercise.

## Mechanism

A BST retains ordered subtrees: every left key is smaller, every right key larger. Removing a node with two children needs a successor/predecessor transplant without losing a subtree. Floor keeps the best key <= query while descending. Prototype may scan a unique-key list; final must build a BST, with O(h) operations and O(n) nodes; an unbalanced tree has h=n.

## Java representation

Start empty. Commands add/remove return Boolean indicating a change; contains returns Boolean; floor returns the largest stored Long <= key or null. Return one result per command. Duplicate adds and missing removals are false. Unknown operation raises `IllegalArgumentException`. `List<Object>` intentionally models the Boolean/Long/null tagged result union.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(List<Command> commands)` returning `List<Object>` with a direct baseline.

**Final:** implement `solve(List<Command> commands)` with the mechanism and bounds described above. Start empty. Commands add/remove return Boolean indicating a change; contains returns Boolean; floor returns the largest stored Long <= key or null. Return one result per command. Duplicate adds and missing removals are false. Unknown operation raises `IllegalArgumentException`. `List<Object>` intentionally models the Boolean/Long/null tagged result union. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

The supplied nested record types define the API. All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
