# Edit distance — Java

## Problem and baseline

Compute unit-cost insertion/deletion/substitution distance between exact code-point sequences. Case conversion, normalization, and transposition are different operations and are outside this distance.

Uncached recursive prefix comparisons repeat overlapping subproblems. A full matrix makes dependencies explicit, then a rolling pair of rows can retain only the previous/current frontier for a distance-only result.

## A focused Java step

Java char length does not measure the unit used by this contract. Convert deliberately before reasoning about empty-prefix distance:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        String text = "😀a";
        int utf16Units = text.length();
        int codePoints = text.codePointCount(0, text.length());
        assert utf16Units == 3;
        assert codePoints == 2;
        assert "é".equals("é") == false;
    }
}
```

Changing units would charge a different number of deletions for the same supplementary symbol. Keeping exact normalization forms also means visually similar strings can have nonzero distance. Row compression must retain diagonal, above, and left dependencies before overwriting them.

## Where the idea is useful

Edit distance is useful for approximate matching and comparison, provided the chosen edit costs and text unit fit the domain. User-visible grapheme distance and domain-specific operations may need a different representation and recurrence.

## Mechanism

Distance between prefixes depends on substitution/match, deletion, and insertion. One previous row plus the current row retains those dependencies without storing the entire matrix. Swapping the shorter input into the columns bounds workspace. Final O(nm) time and O(min(n,m)) DP workspace, plus Unicode conversion arrays.

## Java representation

Return unit-cost Levenshtein distance over exact Unicode code points. Transposition is two edits; case and normalization forms remain distinct. Empty-string distance equals the other string's code-point count. Java `char` iteration is insufficient for supplementary characters.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(String left, String right)` returning `int` with a direct baseline.

**Final:** implement `solve(String left, String right)` with the mechanism and bounds described above. Return unit-cost Levenshtein distance over exact Unicode code points. Transposition is two edits; case and normalization forms remain distinct. Empty-string distance equals the other string's code-point count. Java `char` iteration is insufficient for supplementary characters. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
