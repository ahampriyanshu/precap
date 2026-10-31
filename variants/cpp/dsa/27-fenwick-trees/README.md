# Fenwick trees in C++

A Fenwick tree stores sums of binary-sized blocks. Public indices remain zero based, while internal index i stores a block ending at i whose length is its lowest set bit. Prefix reads repeatedly remove that bit; point additions repeatedly add it.

```cpp
std::size_t i=12;
auto block=i & (~i+1); // 4 for unsigned 12
```

Using internal index zero for an update would never advance because its low bit is zero. Convert a validated public index to index+1. A range total is the difference of two prefix totals, so empty ranges naturally return zero. Unlike a static prefix table, a point update touches only O(log n) blocks. Negative deltas do not affect the structure's correctness. Keep tree state local to each invocation: a later call must not inherit earlier updates. Validate commands and ranges without modifying either caller-owned input vector.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Copy initial values internally. add(index,delta) mutates one value; sum(left,right) queries half-open range. Return only sums. Negative values/deltas and empty ranges valid. Unknown op, add index outside [0,n), or invalid range throws invalid_argument. Prototype copy/scan; final Fenwick O(log n) operations. Preserve both inputs.

Public signatures:

```cpp

Vec<Int> prototype(const Vec<Int>& values,const Vec<std::tuple<std::string,Int,Int>>& commands);
Vec<Int> solve(const Vec<Int>& values,const Vec<std::tuple<std::string,Int,Int>>& commands);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
