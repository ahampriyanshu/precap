# Binary search on the answer in C++

Search capacities, rather than partitions. For a fixed capacity, greedily append the next weight until it would exceed capacity, then start another group. Positive weights make this scan monotone: if a capacity works, every larger one works. The smallest possible capacity is the largest weight; the total weight is always sufficient.

```cpp
Int lo=5,hi=15;
Int mid=lo+(hi-lo)/2; // avoids the overflowing lo+hi formulation
```

A lower-bound search keeps the first feasible value inside `[lo,hi]`, replacing `hi` with a feasible midpoint and `lo` with midpoint+1 after failure. Reordering weights would solve a different packing problem. Extra days do not force empty groups or splitting an item. Validate days even when the input is empty; validate every weight before using the bounds. Runtime is O(n log S), where S is the searched capacity range, and each feasibility scan uses constant extra state.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Return minimum capacity partitioning positive weights in original order into at most days nonempty contiguous groups. Empty weights return 0 for positive days. days<=0 or any weight<=0 throws invalid_argument. Prototype tests capacities; final binary-searches monotone feasibility with O(1) auxiliary state. Preserve input.

Public signatures:

```cpp

Int prototype(const Vec<Int>& weights,const Int& days);
Int solve(const Vec<Int>& weights,const Int& days);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
