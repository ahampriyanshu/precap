# Prefix sums in C++

Store totals at boundaries rather than at elements. A vector with n values has n+1 prefix boundaries: `prefix[0]` is zero and `prefix[i]` excludes element i. This makes a half-open query `[l,r)` equal to `prefix[r]-prefix[l]`; empty ranges subtract a boundary from itself.

```cpp
std::vector<Int> prefix{0,4,2,9}; // values {4,-2,7}
Int middle = prefix[3]-prefix[1]; // 5
```

Negative values do not break cancellation. They do break an assumption that prefix sums are sorted, so this table is not automatically a binary-search index. Validate signed indices before converting to `size_t`; converting -1 first produces a huge unsigned value. `operator[]` does not check bounds. Build the table once to replace repeated O(n) scans with O(1) queries. Updates to an early element invalidate many boundaries, which is why a Fenwick tree is useful for interleaved updates.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Both functions return sums in query order for `[left,right)`. Require `0 <= left <= right <= values.size()` for every query, otherwise throw invalid_argument. Empty ranges yield 0; negative values are valid. Prototype scans ranges; final O(n+q) time/O(n) space. Preserve values and queries on success and failure.

Public signatures:

```cpp

Vec<Int> prototype(const Vec<Int>& values,const Vec<std::pair<Int,Int>>& queries);
Vec<Int> solve(const Vec<Int>& values,const Vec<std::pair<Int,Int>>& queries);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
