# Graphs and breadth-first search in C++

BFS finalizes hop distance when a vertex is first discovered. Every queue layer contains vertices whose distance is one greater than the preceding layer. Mark on enqueue, rather than dequeue, to avoid repeatedly adding the same vertex through parallel edges or cycles.

```cpp
std::vector<std::optional<Int>> distance(n);
distance[source]=0;
// An engaged optional containing zero is a visited source, not an absent distance.
```

Undirected input requires adding both adjacency directions. Self-loops do not improve distance, and duplicate edges must not trigger repeated discoveries. Unreachable vertices remain nullopt, so an arbitrary large number is unnecessary as an infinity sentinel. Check all endpoints before indexing the adjacency vector; caller data must never become an unchecked array index. BFS costs O(V+E) time and space, while enumerating simple paths can be exponential even though it eventually finds the same minimum hop counts.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Undirected vertices 0..n-1; self-loops/parallel edges valid. Return distances in vertex order, source 0, unreachable nullopt. n<=0, invalid source, or invalid endpoint throws invalid_argument. Prototype enumerate simple paths; final adjacency-list BFS O(V+E). Preserve edges.

Public signatures:

```cpp

Vec<Opt<Int>> prototype(const Int& n,const Vec<std::pair<Int,Int>>& edges,const Int& source);
Vec<Opt<Int>> solve(const Int& n,const Vec<std::pair<Int,Int>>& edges,const Int& source);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
