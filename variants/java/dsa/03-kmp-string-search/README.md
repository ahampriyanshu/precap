# KMP string search — Java

## Problem and baseline

Find every pattern start, including overlaps, without repeatedly rescanning a long matched prefix. String positions in this exercise are code-point indices, which can differ from Java char offsets.

A direct search tries each start independently and can compare the same prefix many times. KMP stores fallback information for matched prefixes. Resetting the matched length to zero after a match loses useful overlap information.

## A focused Java step

A proper prefix can also be a suffix of the pattern. That overlap is the state worth retaining after a complete match:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        String pattern = "aba";
        String properPrefix = pattern.substring(0, 1);
        String properSuffix = pattern.substring(pattern.length() - 1);
        assert properPrefix.equals(properSuffix);
        assert "ababa".startsWith(pattern, 0);
        assert "ababa".startsWith(pattern, 2);
    }
}
```

The suffix a can be the beginning of a new match, so completing aba does not discard it. A prefix table generalizes this observation to every matched length. The snippet demonstrates overlap only; it does not build that table or search arbitrary inputs.

## Where the idea is useful

Prefix fallback is useful in streaming text matching and repeated delimiter detection, where preserving already-established comparisons avoids quadratic behavior on repetitive input.

## Mechanism

When a comparison fails, KMP retains the longest proper prefix that is also a suffix of the matched prefix. Falling back through prefix links never moves the text cursor backwards. After a complete match, fall back rather than reset to retain overlaps. Final target O(n+m) time, O(m) workspace.

## Java representation

Return all ascending match starts measured in Unicode code points, not UTF-16 char offsets. Compare exactly, preserving case and normalization form. An empty pattern matches every code-point boundary, including the end. `("ababa","aba")` gives `[0,2]`.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(String text, String pattern)` returning `List<Integer>` with a direct baseline.

**Final:** implement `solve(String text, String pattern)` with the mechanism and bounds described above. Return all ascending match starts measured in Unicode code points, not UTF-16 char offsets. Compare exactly, preserving case and normalization form. An empty pattern matches every code-point boundary, including the end. `("ababa","aba")` gives `[0,2]`. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
