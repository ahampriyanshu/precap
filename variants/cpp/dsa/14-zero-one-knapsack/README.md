# 0/1 knapsack in C++

Each item may be chosen once, so the DP update direction is part of correctness. Updating capacities in descending order ensures `best[c-weight]` still belongs to the previous item layer. Ascending order lets the same item feed its own newly written state and changes the problem into unbounded knapsack.

```cpp
// For one item (weight=2,value=3), capacity 4 must yield 3, not 6.
std::vector<Int> best(5,0);
```

An empty selection is valid; initialize all capacities to zero rather than to a negative sentinel. Duplicate item tuples are separate selectable objects. Positive weights avoid a zero-width dependency, and nonnegative values make unused capacity harmless. Enumerating subsets is a transparent prototype and gives an independent small-input oracle. The final single-row DP costs O(nC) time/O(C) space. Use signed loop cursors to avoid underflow at capacity zero.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Items are (positive weight, nonnegative value); capacity is nonnegative. Return max value with each item used at most once. Duplicate tuples are separate items. Invalid weight/value/capacity throws invalid_argument. Prototype enumerate subsets; final descending-capacity O(nC) DP/O(C) space. Preserve input.

Public signatures:

```cpp

Int prototype(const Vec<std::pair<Int,Int>>& items,const Int& capacity);
Int solve(const Vec<std::pair<Int,Int>>& items,const Int& capacity);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
