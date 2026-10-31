# Backtracking and pruning in C++

Backtracking explores partial assignments and undoes a choice before trying the next. A used-value set enforces uniqueness as soon as a candidate is considered, rather than discovering duplicates after a complete assignment. Sort and deduplicate each position's choices to make the first successful complete path lexicographically smallest.

```cpp
std::set<Text> used;
auto [it,inserted]=used.insert(U"A");
if(inserted) { /* explore */ used.erase(it); }
```

Do not confuse lexicographically sorting the final chosen values with choosing the smallest valid vector in input-position order. For choices {A,B} then {A}, greedily choosing A fails, so the search must backtrack to B. Empty input has one complete assignment: the empty vector. An empty inner choice list has none. These differ naturally through recursion's base case. Pruning avoids invalid prefixes but worst-case work remains exponential. Own sorted copies so neither nested input vector is changed.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Choose one Text per inner vector with no repeated Text. Return lexicographically smallest assignment in original position order, or nullopt. Duplicate choices add no alternatives. [] returns an engaged empty vector; an empty inner list makes assignment impossible. Prototype enumerate complete combinations; final sorted choices with early rejection/rollback. Preserve all input vectors.

Public signatures:

```cpp

Opt<Vec<Text>> prototype(const Vec<Vec<Text>>& allowed);
Opt<Vec<Text>> solve(const Vec<Vec<Text>>& allowed);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
