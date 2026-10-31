# Arrays and linear scans in C++

A vector's position belongs to the original order. Finding a maximum value and finding its first position are distinct questions. Keep an optional position until the first element arrives; initializing a position to zero on an empty vector would create a nonexistent element. After each iteration, the total summarizes the consumed prefix, and the retained index points to its first maximum.

```cpp
std::vector<Int> readings{8, 2, 8};
auto first = std::max_element(readings.begin(), readings.end());
// first - readings.begin() is 0; replacing on >= would select 2.
```

Separate accumulation and maximum searches still cost O(n). Combining them reduces traversals and requires constant extra state. Use a signed wide accumulator: an `int` total can overflow even when every individual element fits in `int`. Signed overflow is undefined behavior. Do not sort just to extract a maximum: sorting changes the meaning of its index and costs O(n log n).

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Both stages return `(total, first_maximum_index)` for nonnegative loads. Ties choose the smallest index; empty input returns `(0, nullopt)`. Prototype: direct scans. Final: one O(n) scan and O(1) auxiliary space. Preserve input; no additional validation. This C++ variant uses bounded Int arithmetic rather than arbitrary precision; its wide-accumulator case stays within Int range.

Public signatures:

```cpp

std::pair<Int,Opt<Int>> prototype(const Vec<Int>& loads);
std::pair<Int,Opt<Int>> solve(const Vec<Int>& loads);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
