# KMP string search in C++

A mismatch after a long prefix need not restart comparison at the next text position. KMP stores each prefix's longest proper border: a prefix that is also a suffix. For `ababac`, the border lengths are `0,0,1,2,3,0`. On the final mismatch, the candidate border falls from 3 to 1 to 0 without moving the text cursor backward.

```cpp
Text pattern=U"abab";
std::vector<Int> borders{0,0,1,2};
// A full match falls back to borders.back()==2, retaining overlapping matches.
```

Resetting to zero after a match would miss the second occurrence in `ababab`. Each fallback spends progress gained by prior matches, yielding O(n+m) total work. Code-point indices are distinct from UTF-8 byte positions and from visible grapheme positions; `Text` makes the selected unit explicit. Handle the empty pattern before indexing it: it matches all n+1 boundaries. A naive character-by-character search is a useful prototype because its independent comparison structure makes overlap behavior easy to review.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Both stages return all ascending start indices, including overlaps, comparing `Text` code points exactly. Empty pattern matches every boundary including the end; nonempty pattern in empty text yields no matches. Prototype O(nm); final KMP O(n+m) time/O(m) auxiliary space. No normalization or input mutation.

Public signatures:

```cpp

Vec<Int> prototype(const Text& text,const Text& pattern);
Vec<Int> solve(const Text& text,const Text& pattern);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
