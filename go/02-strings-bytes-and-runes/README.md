# Strings, bytes, and runes

A Go string is an immutable sequence of bytes. It can hold arbitrary bytes, including invalid UTF-8. `len(text)` reports bytes, and `text[i]` returns one byte. A rune is an alias for int32 used for a Unicode code point. Decoding a string with range yields code points, but each range index is still a byte offset. A code point is not necessarily a user-visible character: an accent can be a separate combining rune and an emoji may contain several runes.

```go
text := "éx"
fmt.Println(len(text), len([]rune(text))) // 3 bytes, 2 code points
for byteOffset, symbol := range text {
    fmt.Println(byteOffset, symbol) // offsets 0 and 2
}
```

## Choose a unit before writing an API

Byte positions suit file formats and UTF-8 byte buffers. Rune positions suit code-point algorithms. Neither automatically matches cursor positions in a text editor. Slicing by a byte offset inside a multibyte encoding can produce invalid UTF-8, so do not mix rune counts with raw substring offsets. `unicode/utf8` validates and decodes encodings; `unicode` classifies code points into letters and digits. ASCII-only validation is narrower than Unicode category classification and should be chosen deliberately.

Strings are immutable, so converting a mutable byte slice to a string normally provides the ownership semantics of a copy. Converting to `[]rune` allocates a decoded sequence; ranging directly is useful for a single scan. A strings.Builder accumulates text without repeatedly copying an ever-growing prefix; its zero value is ready to use, and copying a nonzero builder is not a supported ownership pattern. A bytes.Buffer suits byte-oriented protocols.

## Invalid encoding is a policy decision

Range decodes invalid bytes as replacement runes and advances. That is useful for permissive display, but it can hide corrupted input. Validate UTF-8 first when the API promises valid text. The literal replacement character U+FFFD is itself valid text and must not be confused with a decoder's replacement for an invalid byte. Unicode categories also distinguish a combining mark from a letter and an Arabic-Indic digit from an ASCII digit.

Case conversion, case folding and canonical normalization are separate operations. Lowercasing does not implement all caseless matching expansions; no normalization is implied by rune iteration. APIs for identifiers and search should state exactly which transformation applies rather than assuming visually similar text compares equal.

The exercise measures encoding and category facts with a clear invalid-input policy. It is useful for validation and telemetry, but it does not count grapheme clusters or natural-language words. All fields have precise units so callers can interpret them correctly.

## Practice

Implement `Prototype(text string) (TextStats,error)` with straightforward independent scans; `Solve` validates UTF-8 then performs one rune-category scan. Return byte length, rune count, Unicode letter count, Unicode digit count. Invalid UTF-8 returns nonnil error and zero TextStats. Empty text returns all zeros. Combining marks are not letters; U+FFFD literal and emoji are valid runes. Do not normalize or change input. Final time O(byte length), O(1) auxiliary space; Bytes/Runes count their stated units.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
