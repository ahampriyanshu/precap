# Edit distance in C++

Levenshtein distance compares prefixes. A cell may delete the left suffix character, insert the right suffix character, or align the two final characters with substitution cost zero or one. All three dependencies lie in the previous row or the current row's previous cell.

```cpp
Text a=U"ab",b=U"ba";
// Two edits are needed: transposition is not an allowed single operation.
```

Distance-only output permits discarding old rows. Keep the shorter string on the column axis so auxiliary memory is O(min(n,m)), and retain the old diagonal before overwriting a cell. The first row and column encode converting to or from an empty prefix. `Text` preserves code-point semantics; UTF-8 byte distance would overcharge many non-ASCII edits. Canonical equivalence is not assumed: a composed accent and a combining sequence can have different lengths and edit distance. An uncached recursive prototype demonstrates the recurrence but repeats a large tree of overlapping subproblems.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Unit-cost insertion/deletion/substitution over exact Text code points; no transposition, folding, or normalization. Empty-to-nonempty distance is its code-point count. Prototype uncached recursion; final O(nm) DP with O(min(n,m)) auxiliary memory. Preserve strings.

Public signatures:

```cpp

Int prototype(const Text& left,const Text& right);
Int solve(const Text& left,const Text& right);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
