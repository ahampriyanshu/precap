# Text, Unicode, and parsing

A JavaScript string is an immutable sequence of UTF-16 code units. That representation predates many modern emoji and explains why a visible character can occupy multiple indexed positions. Text processing must choose its unit before measuring lengths, clipping input, or reporting positions.

## Code units, code points, and graphemes

Indexing and `length` use code units. String iteration uses code points. A grapheme can combine multiple code points into one user-perceived character, including a base plus combining marks or an emoji sequence.

```javascript
const text = "A😀B";
console.log(text.length);         // 4 code units
console.log([...text].length);    // 3 code points
console.log("é".length, "e\u0301".length); // 1 and 2
```

Array.from is suitable for code-point algorithms, but it is not a universal visible-character counter. For user-facing cursor movement or previews, Intl.Segmenter can provide grapheme boundaries in supporting runtimes. A byte limit is another contract entirely: encode with TextEncoder and consider how a storage or network protocol counts bytes.

## Matching and ordering are independent policies

Equality compares exact code-unit sequences. Canonically equivalent Unicode text can compare unequal until normalized. Case conversion is neither a universal case-folding operation nor a complete search-ranking policy. Locale-sensitive comparison can be appropriate for display but undesirable for stable storage keys or reproducible algorithm output.

```javascript
const composed = "é", decomposed = "e\u0301";
console.log(composed === decomposed); // false
console.log(composed.normalize("NFC") === decomposed.normalize("NFC")); // true
```

Normalize only when the domain requires it, and apply the same policy at both write and lookup. Changing normalization can merge previously distinct identifiers. Keep an original display representation when appropriate, and avoid silently changing signed payloads or opaque tokens.

## Regular expressions need a bounded purpose

A regular expression describes a text pattern, not a full semantic validator. Anchors matter for whole-input validation. Unicode mode changes some matching behavior but does not make a pattern grapheme-aware. Stateful global/sticky expressions retain lastIndex, which can surprise a reused validator.

```javascript
const digit = /[0-9]/g;
console.log(digit.test("1"), digit.test("1")); // true, false
```

For a simple yes/no validator, avoid unnecessary global state. Review untrusted input length and worst-case matching behavior; some nested repetition patterns can cause extreme backtracking. Complex structured formats are often clearer with a real parser followed by explicit domain validation.

## Parsing should preserve a useful error boundary

Splitting on a delimiter is enough only when escaping, quoting, empty fields, and repeated delimiters have defined meanings. URLSearchParams, JSON.parse, and a CSV parser each implement different grammars. A parser's success does not establish authorization, safe destinations, or allowed field values.

In production, record positions in the same unit the consumer expects. A backend byte offset is not automatically a browser selection offset. Test astral symbols, combining sequences, empty input, and exact boundaries rather than treating ASCII examples as complete text coverage.

## Practice

Prototype: implement `codePoints(text)` returning an array of its exact Unicode code-point strings. Input is a string; do not normalize it.

Final: implement `clipText(text, maximum)` returning the first at most maximum code points. maximum must be a nonnegative safe integer or throw RangeError. This exercise deliberately uses code points, not graphemes. Keep combining marks distinct and do not alter text beyond clipping.

Complete the exported stubs in `exercise.mjs`. The prototype and final stages have separate checks.

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Use Node.js 20+ locally, or the website's browser worker. Tests are standard-library only and check the documented behavior; they do not prove performance or force garbage collection.
