# Strings, Unicode, and standard containers

`std::string` owns contiguous bytes. `string_view` borrows bytes and carries a length; it need not end at a null terminator. A UTF-8 string's size counts code units, not Unicode code points or visible grapheme clusters. `std::u32string` stores code points but still does not make a combining sequence a single visible character.

```cpp
std::string bytes="é";      // UTF-8 source execution encoding: usually two bytes
Text points=U"é";          // one char32_t code point
std::string embedded("a\0b",3); // size 3, despite the embedded NUL
```

Choose container semantics before choosing syntax. A vector owns contiguous elements and supports fast indexed access, but growth can invalidate pointers. A deque supports cheap growth at both ends, with different iterator invalidation rules. A list keeps node addresses stable across insertions but adds allocation and poor locality. An ordered map provides sorted keys and logarithmic lookup; an unordered map provides expected constant lookup without deterministic iteration order. `operator[]` on a map inserts a missing key, so it can mutate state during what looks like a read; use find/contains for read-only membership.

```cpp
std::map<std::string,Int> counts;
auto found=counts.find("missing"); // no insertion
// counts["missing"] would create an entry containing zero.
```

UTF-8 decoding validates more than continuation-byte shape. Reject overlong encodings, surrogate code points, and values above U+10FFFF. A valid four-byte sequence is one output code point. An invalid byte sequence must not be silently accepted as text or passed to locale-dependent cctype functions. Always convert a byte to unsigned char before numeric bit inspection; signed char can otherwise sign-extend high bytes. A decoded string owns its code points and remains valid after the original bytes change. This exercise deliberately does not normalize, casefold, or combine graphemes.

## Practice

Prototype: count every input byte into an ordered map<unsigned char,Int>, including NUL and high bytes. Final: strictly decode UTF-8 into owned Text. Accept every Unicode scalar value, including NUL and U+10FFFF; reject invalid leading/continuation bytes, truncation, overlong forms, surrogates, and out-of-range scalars with invalid_argument. Empty bytes decode to empty. Preserve input; no normalization or replacement characters.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

```cpp

inline std::map<unsigned char,Int> prototype(std::string_view bytes);
inline Text solve(std::string_view bytes);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
