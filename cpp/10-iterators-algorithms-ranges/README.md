# Iterators, algorithms, ranges, and invalidation

An iterator is a traversal position, not necessarily a pointer. Algorithms require capabilities: sort needs random access, while find needs only input traversal. A half-open range `[first,last)` excludes the end iterator; dereferencing end is invalid even when it points just past allocated storage.

```cpp
std::vector<Int> values{3,1,3,2};
std::sort(values.begin(),values.end());
auto logical_end=std::unique(values.begin(),values.end());
values.erase(logical_end,values.end()); // unique alone does not shrink size
```

Algorithm contracts include ordering assumptions. A comparator must define strict weak ordering: using <= instead of < can make a sort's behavior undefined. Never mutate keys in a way that violates a sorted container's invariant. Projection and predicate state should be deliberate; capturing a short-lived reference in a deferred callable creates a lifetime bug.

Vector insertion can invalidate every iterator when reallocation occurs, and erase invalidates the erased position and everything after it. In an erase loop, use the iterator returned by erase rather than incrementing the invalidated one. List insertion has different guarantees; do not transfer invalidation folklore between containers.

```cpp
for(auto it=values.begin();it!=values.end();) {
 if(*it<0) it=values.erase(it); else ++it;
}
```

C++20 ranges can compose lazy views, but laziness does not own underlying data or extend lifetimes. A filter view sees a borrowed container and can be invalidated when that container changes. Some library distributions implement subsets of ranges; the exercises use broadly supported iterator algorithms and explicit owned return values. Sorting and deduplicating an owned vector is a useful normalization boundary before binary search. The final exercise also checks aliasing: incoming may be the same vector as values, so copy what is needed before mutating the destination.

## Practice

Prototype returns sorted unique values without mutating input. Final merges values and incoming, removes values below minimum, sorts ascending, deduplicates, and commits into values. Incoming is preserved when distinct, and MAY ALIAS values; self-merge must behave as though both inputs were read before mutation. Return void. No dangling iterator use, and no input sortedness assumption. An empty result is valid.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

```cpp

inline Vec<Int> prototype(const Vec<Int>& values);
inline void solve(Vec<Int>& values,const Vec<Int>& incoming,Int minimum);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
