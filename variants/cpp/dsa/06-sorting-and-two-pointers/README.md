# Sorting and two pointers in C++

Sorted order lets each comparison eliminate candidates. If the smallest-plus-largest sum is too small, every pair using that smallest value is too small, so advance the left pointer. If too large, move the right pointer. These eliminations depend on order, not on positivity.

```cpp
std::vector<Int> sorted{4,1,3,2};
std::sort(sorted.begin(),sorted.end()); // sort a copy, never the caller's vector
```

The answer is a value pair, not a pair of original indices. Distinct positions still matter: one 5 cannot satisfy target 10, while two 5s can. Starting at the minimum left value ensures the first matching pair is lexicographically smallest. Sorting costs O(n log n); the subsequent inward scan is O(n). Copying costs O(n) storage but protects the original order. Avoid unsigned right-index underflow on an empty vector: use signed cursors or iterator pairs with an explicit nonempty guard.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Both stages return the lexicographically smallest ascending value pair summing to target from distinct positions, or nullopt. Negatives and duplicates are valid. Prototype tests all pairs; final sorts a copy then scans inward. Preserve input.

Public signatures:

```cpp

Opt<std::pair<Int,Int>> prototype(const Vec<Int>& weights,const Int& target);
Opt<std::pair<Int,Int>> solve(const Vec<Int>& weights,const Int& target);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
