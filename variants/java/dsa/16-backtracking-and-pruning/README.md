# Backtracking and pruning — Java

## Problem and baseline

Assign one unique label per position while producing the lexicographically smallest complete assignment. A locally smallest choice may need to be undone when a later position has no alternative.

Generating complete products and checking uniqueness at the end wastes work on already-impossible prefixes. Early rejection and rollback prune the search, but sorted options alone do not prove that the first local choice can remain committed.

## A focused Java step

The first position must sometimes give up its preferred label so the second can complete:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        List<String> first = List.of("A", "B");
        List<String> second = List.of("A");
        Set<String> used = new HashSet<>(List.of("A"));
        assert second.stream().noneMatch(label -> !used.contains(label));
        used.remove("A"); // undo the tentative choice before another branch
        assert !used.contains("A");
    }
}
```

Only state introduced by the failing branch should be removed. The search must restore both the chosen-prefix list and the used-label set before trying another option. A full assignment is a stronger success condition than a nonempty partial prefix.

## Where the idea is useful

Constraint search is useful for small matching/placement problems where direct greedy decisions can fail. Pruning improves practical work but does not remove worst-case exponential behavior; larger special cases may need a matching algorithm.

## Mechanism

Backtracking owns one choice per input position and a set of choices already used. Remove the tentative choice on every failed branch. Sorted unique options and the first complete success produce a canonical assignment. Pruning rejects impossible partial states but worst-case work remains exponential.

## Java representation

Choose one string per inner list with no string reused; return the lexicographically smallest full assignment in input-position order, or null. Empty outer input returns an empty list; an empty option list makes completion impossible. Duplicate options count once. Java ordering is String.compareTo (UTF-16 lexical order).

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(List<List<String>> allowed)` returning `List<String>` with a direct baseline.

**Final:** implement `solve(List<List<String>> allowed)` with the mechanism and bounds described above. Choose one string per inner list with no string reused; return the lexicographically smallest full assignment in input-position order, or null. Empty outer input returns an empty list; an empty option list makes completion impossible. Duplicate options count once. Java ordering is String.compareTo (UTF-16 lexical order). Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
