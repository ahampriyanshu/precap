# Monotonic deques in C++

Keep indices of values that can still become a window maximum. A newer value at least as large makes an older candidate unnecessary: the newer value expires later and is never smaller. Remove such candidates from the back; remove expired indices from the front.

```cpp
std::deque<std::size_t> candidates;
// Compare loads[candidates.back()], not the numeric index itself.
```

Indices distinguish equal-valued entries with different expiration times. The front is the maximum only after expired indices have been removed. Every index enters once and leaves at most once, so repeated-looking inner loops still cost O(n) total. Memory is bounded by the window width. Validate positive width before the empty-input shortcut; an invalid width does not become valid when there are no loads. A width larger than the input has no complete window and yields an empty result.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Return one maximum for every full contiguous window. Negative loads and duplicates are valid. width<=0 throws invalid_argument even for empty input. Empty input or width>size returns empty. Prototype rescans each window; final monotonic deque O(n) time/O(width) auxiliary space. Preserve loads.

Public signatures:

```cpp

Vec<Int> prototype(const Vec<Int>& loads,const Int& width);
Vec<Int> solve(const Vec<Int>& loads,const Int& width);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
