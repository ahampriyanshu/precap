# Tries and prefix search in C++

A trie stores a path per code-point prefix. A terminal flag distinguishes a complete word from a prefix that only leads to longer words. Without that flag, inserting `cold` and `colder` makes it impossible to distinguish whether `cold` is independently present.

```cpp
struct TrieNode {bool terminal=false;std::map<char32_t,std::unique_ptr<TrieNode>> children;};
// Ordered child keys make depth-first emission lexicographic.
```

Following the query prefix avoids exploring unrelated branches, then a depth-first traversal emits a terminal word before longer descendants. Duplicate inserts set the same terminal flag and do not duplicate results. Empty words terminate at the root. Building the trie still costs work proportional to all input code points; querying one prefix does not erase that cost. An ordered child map adds logarithmic branching cost; a hash map would need sorted traversal keys. Stop once the output limit is reached and preserve the original word collection.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Return at most limit unique Text words beginning with exact prefix, sorted lexicographically by code points. Empty words/prefix valid; zero limit returns empty; negative limit throws invalid_argument. Prototype filter/deduplicate/sort; final build trie, follow prefix, ordered traversal. Include construction cost. Preserve words.

Public signatures:

```cpp

Vec<Text> prototype(const Vec<Text>& words,const Text& prefix,const Int& limit);
Vec<Text> solve(const Vec<Text>& words,const Text& prefix,const Int& limit);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
