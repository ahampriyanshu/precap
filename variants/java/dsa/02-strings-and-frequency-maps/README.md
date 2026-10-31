# Strings and frequency maps — Java

## Problem and baseline

Find missing letter multiplicities, rather than merely checking whether each letter occurs. Requested "aaa" and loaded "ab" require two more a values even though a is present.

A set loses counts. Repeatedly counting a whole string for each requested letter preserves meaning but repeats work. Build frequency maps only after applying the complete-string normalization rule, then subtract and retain positive deficits.

## A focused Java step

Case conversion can expand a character before code-point counting. This Java normalization deliberately specifies both transformations:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        String original = "ß";
        String normalized = original.toUpperCase(Locale.ROOT).toLowerCase(Locale.ROOT);
        assert original.codePointCount(0, original.length()) == 1;
        assert normalized.equals("ss");
        assert normalized.codePointCount(0, normalized.length()) == 2;
    }
}
```

Counting before normalization would see one letter instead of two. Locale.ROOT avoids dependence on the machine locale; the documented two-step conversion is still a Java-specific normalization rule, not a promise of universal Unicode casefold equivalence.

## Where the idea is useful

Multiset subtraction is useful for resource deficits, required symbol inventories, and reconciliation of repeated values. Decide normalization and output ordering at the boundary so different producers cannot silently disagree about identity.

## Mechanism

A set records existence; a frequency map records multiplicity. Deficits must subtract counts before dropping zero or negative values. Normalize whole strings before iterating code points because case conversion may expand characters. Final target: O(n+m+k log k), including sorted output, with O(k) counts.

## Java representation

Normalize each string with `toUpperCase(Locale.ROOT).toLowerCase(Locale.ROOT)`, then count only code points for which `Character.isLetter` is true. Return positive requested-minus-loaded deficits in ascending code-point key order, with each key a one-code-point String. This explicit Java normalization folds `ß` to `ss`; it is not a universal Unicode casefold operation. Do not otherwise normalize. Empty strings are valid. `("ab","aaa")` gives `{a=2}`.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(String loaded, String requested)` returning `Map<String,Integer>` with a direct baseline.

**Final:** implement `solve(String loaded, String requested)` with the mechanism and bounds described above. Normalize each string with `toUpperCase(Locale.ROOT).toLowerCase(Locale.ROOT)`, then count only code points for which `Character.isLetter` is true. Return positive requested-minus-loaded deficits in ascending code-point key order, with each key a one-code-point String. This explicit Java normalization folds `ß` to `ss`; it is not a universal Unicode casefold operation. Do not otherwise normalize. Empty strings are valid. `("ab","aaa")` gives `{a=2}`. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
