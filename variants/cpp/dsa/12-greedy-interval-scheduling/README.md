# Greedy interval scheduling in C++

Earliest finish time leaves the largest remaining suffix of time available. Exchange the first job of any optimal schedule for a job ending no later: the replacement cannot invalidate its later jobs. Repeating this exchange supports greedy selection.

```cpp
// Compare (end,start,id), rather than the input tuple's (id,start,end).
auto key=[](const auto& j){return std::tuple{std::get<2>(j),std::get<1>(j),std::get<0>(j)};};
```

The canonical tie rule matters even when many different schedules have equal size. Touching half-open intervals are compatible: start equal to the previous end is accepted. A numeric initial end of zero would accidentally reject valid negative-time jobs; use an optional previous end. Validate every duration and ID uniqueness before producing a result. Sorting a copied vector protects caller order and costs O(n log n). The acceptance scan uses constant state excluding output.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Jobs are (unique_id,start,end), with end>start. Duplicate IDs or invalid durations throw invalid_argument. Sort by (end,start,id), accept each job whose start>=last accepted end, return IDs in that order. Empty returns empty; negative times and touching jobs are valid. Prototype subset exploration must reproduce this canonical optimum; final greedy O(n log n). Preserve input.

Public signatures:

```cpp

Vec<std::string> prototype(const Vec<std::tuple<std::string,Int,Int>>& jobs);
Vec<std::string> solve(const Vec<std::tuple<std::string,Int,Int>>& jobs);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
