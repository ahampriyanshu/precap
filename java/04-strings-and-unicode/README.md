# Strings and Unicode

## Text has several lengths

String is immutable UTF-16 text. `length()` counts 16-bit char units. Supplementary code points use surrogate pairs, so one visible symbol may occupy two chars. A code point is still not a grapheme cluster: a base letter plus a combining mark can form one displayed character with two code points. Neither char indexing nor code-point indexing alone implements user-visible cursor movement.

```java
String text = "A😀é";
assert text.length() == 5;
assert text.codePointCount(0, text.length()) == 4;
```

Use codePoints when the contract is defined over code points; use offsetByCodePoints to translate boundaries back into UTF-16 substring indices. Splitting a surrogate pair produces ill-formed text even though String can store it. This course's text exercises assume well-formed UTF-16 inputs unless a specific lesson says otherwise.

## Equality and transformations

String.equals compares the exact encoded sequence. Canonically equivalent text may differ (`é` versus `e` plus combining accent). Normalization is a deliberate domain choice; `Normalizer.normalize(text, Form.NFC)` changes representation. Case conversion can expand characters and depends on locale, so normalize complete strings before iterating transformed code points. Locale.ROOT avoids machine-locale dependence for protocol-oriented rules, but lowercase is not a universal casefold.

```java
String composed = "é";
String decomposed = "é";
assert !composed.equals(decomposed);
assert java.text.Normalizer.normalize(decomposed,
       java.text.Normalizer.Form.NFC).equals(composed);
```

Repeated concatenation in a loop can copy an ever-growing prefix and become quadratic. StringBuilder supports incremental construction, while String.join expresses joining existing pieces. `substring` creates a new string on current JDKs; do not assume it is a zero-copy view. Charset conversion is another boundary: explicitly choose UTF-8 rather than a platform default, and decide how malformed byte sequences should be handled.

## Practice

**Prototype:** `codePointLength(String text) -> int` returns the Unicode code-point count; empty gives zero.

**Final:** `sliceCodePoints(String text,int from,int to) -> String` selects [from,to) measured in code points, preserving the exact sequence without case conversion/normalization. Require 0 <= from <= to <= code-point count, otherwise IllegalArgumentException. Empty slices are valid, including at the end. Do not split a surrogate pair; input is well-formed UTF-16. Combining marks count separately.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
