# Topological sorting in C++

A legal next vertex has indegree zero after previously selected vertices have been removed. Choosing the smallest legal vertex at every step yields the lexicographically smallest topological ordering, because every alternative first difference would choose a larger currently legal value.

```cpp
std::priority_queue<Int,std::vector<Int>,std::greater<>> ready;
// A FIFO queue gives a valid order, but need not give the smallest one.
```

Deduplicate edges before incrementing indegrees. Counting a duplicate twice but decrementing once can manufacture a false cycle. Self-loops are real cycles. If fewer than n vertices are emitted, a cycle remains; return nullopt rather than an incomplete order. An empty graph has an engaged empty ordering. The min-heap adds O(V log V) work on top of O(V+E) adjacency processing. Exhaustive permutation testing is only a small-input prototype.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Directed (u,v) means u before v. Return lexicographically smallest complete ordering or nullopt for any cycle. Duplicate edges count once. n=0 returns engaged empty vector. Negative n or endpoint out of range throws invalid_argument. Prototype lexicographic permutations; final indegrees/min-heap frontier. Preserve edges.

Public signatures:

```cpp

Opt<Vec<Int>> prototype(const Int& n,const Vec<std::pair<Int,Int>>& edges);
Opt<Vec<Int>> solve(const Int& n,const Vec<std::pair<Int,Int>>& edges);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
