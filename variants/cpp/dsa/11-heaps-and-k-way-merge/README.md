# Heaps and k-way merge in C++

Sorted feeds expose only their next unconsumed value as a candidate. A min-heap stores `(value, feed_index, element_index)` for each active feed. After extracting the minimum, advance only that feed. Other feeds already have their cheapest remaining values represented.

```cpp
using Candidate=std::tuple<Int,std::size_t,std::size_t>;
std::priority_queue<Candidate,std::vector<Candidate>,std::greater<>> frontier;
```

`priority_queue` is a max-heap by default; forgetting the comparator reverses output order. Tuple tie breakers make equal values deterministic without discarding duplicates. Empty feeds contribute no candidate but still require inspection. For N total values and K feeds, initialization inspects O(K) feeds, and output costs O(N log(K+1)) with at most K candidates. Concatenate-and-sort is simpler but discards the useful sorted-feed structure and requires sorting all N values. Holding const references prevents accidental destructive consumption of the feed vectors.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

All inner feeds are already sorted nondecreasing. Return every value sorted, retaining duplicates. Empty outer/inner vectors are valid; no sortedness validation is required. Prototype concatenate/sort; final one heap frontier per active feed. Preserve outer and inner vectors.

Public signatures:

```cpp

Vec<Int> prototype(const Vec<Vec<Int>>& feeds);
Vec<Int> solve(const Vec<Vec<Int>>& feeds);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
