# Document Search Engine — Java

## Ownership and transitions

A positional index maps tokens to document occurrence positions; phrase search intersects positions with offsets. Updating a document must remove its old postings before publishing new content, or stale terms and phrase positions survive. Ranking sorts score descending then ID. Tokenization and full reindexing cost O(document length); index lookup narrows candidates but phrase intersection and ranking still cost work.

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

Phrase matching depends on token positions and counts overlapping starts. Removing a document therefore requires removing both term membership and positional data:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        List<String> tokens = List.of("a", "a", "a");
        List<String> phrase = List.of("a", "a");
        assert tokens.subList(0, 2).equals(phrase);
        assert tokens.subList(1, 3).equals(phrase);
        assert !List.of("ab").contains("a");
    }
}
```

There are two matching starts, while a whole token ab is distinct from a. A set-only inverted index can identify candidate documents but cannot recover these phrase counts by itself.

## Design boundary

Updates must replace all old postings and token counts as one public transition. The exercise fixes ASCII tokenization and exact deterministic ranking; stemming, linguistic segmentation, relevance scoring, persistence, and concurrent publication would need their own contracts.

## Practice

**Prototype:** `tokenize(text)` lowercases with Locale.ROOT then returns ASCII [a-z0-9]+ runs in order with duplicates; punctuation/non-ASCII characters separate runs. New list each call.

**Final:** SearchEngine validates nonempty document IDs. `add` returns false on duplicate preserving text; `get` is nullable; `update/delete` return false when absent. `search(term,limit)` requires exactly one query token even at limit zero. `searchPhrase(phrase,limit)` counts consecutive-token starts, including overlaps; empty phrase yields empty. Both return Hit(documentId,score), sorted score descending/ID, at most limit; negative limit raises. `stats` counts current documents (including empty) and current tokens. No stale data may remain after replacement/deletion/reuse.

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
