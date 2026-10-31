# Strings and frequency maps in C++

Multiplicity requires counts, rather than a set. The normalization order matters: casefold the whole string, then retain alphabetic code points. U+00DF expands to two `s` code points; counting original characters first loses that information. Canonical Unicode normalization is a separate policy and is deliberately absent.

```cpp
Text text = U"éÉß"; // four folded letters: é, é, s, s
std::map<char32_t, Int> counts;
// Increment each code point after unicode_casefold(text) and unicode_isalpha(c).
```

C++ `std::tolower` does not implement full Unicode case folding. A byte of UTF-8 is also not a character, and passing a negative signed `char` to cctype functions is invalid. This lesson provides `unicode.hpp` with Unicode casefold and alphabetic tables generated for the documented Unicode version. Those helpers are infrastructure, not the frequency-map solution. `Text` stores code points, so expansions and sorted result keys remain explicit. A map sorts keys; an unordered map would require a separate sorted emission step. Final counting costs O(L log U) with ordered maps, or expected O(L) plus O(U log U) result ordering with hash maps.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Implement both stages over `Text`. Use supplied `unicode_casefold` and `unicode_isalpha`, retain only alphabetic folded code points, return positive requested-minus-loaded deficits in `std::map<char32_t,Int>`. Do not normalize further. Empty strings are valid. Prototype rescans each requested letter; final builds counts. Unicode behavior uses the bundled table version; this deliberately pins Unicode instead of depending on the host locale.

Public signatures:

```cpp

std::map<char32_t,Int> prototype(const Text& loaded,const Text& requested);
std::map<char32_t,Int> solve(const Text& loaded,const Text& requested);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
