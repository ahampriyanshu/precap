# Tries and prefix search — Java

## Problem and baseline

Complete an exact prefix with unique words in a canonical order and bounded result count. A prefix may itself be a stored word and still have longer descendants.

Filtering and sorting every word is a valid baseline. A trie shares prefix paths, but it needs a terminal marker separate from child existence. Stopping at the first node with children would omit words that are also prefixes.

## A focused Java step

Terminality and continuation are independent facts at one trie position:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        record PrefixState(boolean terminal, SortedSet<Character> children) {}
        var atA = new PrefixState(true, new TreeSet<>(List.of('b', 'c')));
        assert atA.terminal(); // "a" itself is stored
        assert atA.children().contains('b'); // "ab" can also be stored
        assert atA.children().size() == 2;
    }
}
```

The terminal must be emitted before longer suffixes in lexical order. Traversal also needs sorted children and an early limit check. Building the index still costs the total input character count, even if the returned completion list is short.

## Where the idea is useful

Tries suit repeated prefix queries, lexical indexes, and autocomplete-like tasks when shared prefixes justify construction cost. A one-off query over a tiny list may be simpler with filtering and sorting.

## Mechanism

A trie separates the prefix walk from suffix enumeration. A terminal marker distinguishes a stored word from an internal prefix, including the empty word at the root. Sort child characters while traversing and stop at the limit. Include index construction O(total input characters); result enumeration also costs emitted characters, not merely result count.

## Java representation

Return at most limit distinct words starting with the exact case-sensitive prefix, in Java String.compareTo order. Empty strings/prefixes are valid, limit zero returns empty, negative limit raises `IllegalArgumentException`. Final must build a trie; prototype may filter/deduplicate/sort.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(List<String> words, String prefix, int limit)` returning `List<String>` with a direct baseline.

**Final:** implement `solve(List<String> words, String prefix, int limit)` with the mechanism and bounds described above. Return at most limit distinct words starting with the exact case-sensitive prefix, in Java String.compareTo order. Empty strings/prefixes are valid, limit zero returns empty, negative limit raises `IllegalArgumentException`. Final must build a trie; prototype may filter/deduplicate/sort. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
