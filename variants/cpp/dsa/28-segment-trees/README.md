# Segment trees in C++

A segment tree stores a composable summary for each interval. Minimum is associative, so disjoint canonical blocks can be combined in any grouping. There is no subtraction operation that removes an old prefix minimum, which is why prefix-sum tricks do not answer range minimum.

```cpp
std::optional<Int> empty;
// combine(empty,x)=x; combine(a,b)=min(*a,*b) when both exist.
```

An optional identity distinguishes an empty range from a real value equal to a numeric sentinel. Build leaves from the initial input and combine parents bottom-up in O(n). A set operation replaces one leaf and recomputes its ancestors; a half-open query visits O(log n) blocks. Be precise about replacement: adding the supplied value would solve a different update API. Keep internal storage independent of the original vector, including when a later command is invalid. A scan prototype is a practical oracle for update/query interleavings.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Initialize internal temperatures. set(index,value) replaces; min(left,right) returns minimum of [left,right), nullopt for empty. Return only query results. Unknown op, invalid set index, or range outside 0<=left<=right<=n throws invalid_argument. Prototype copy/scan; final O(n) build/space, O(log n) updates/queries. Preserve inputs on failure too.

Public signatures:

```cpp

Vec<Opt<Int>> prototype(const Vec<Int>& temps,const Vec<std::tuple<std::string,Int,Int>>& commands);
Vec<Opt<Int>> solve(const Vec<Int>& temps,const Vec<std::tuple<std::string,Int,Int>>& commands);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
