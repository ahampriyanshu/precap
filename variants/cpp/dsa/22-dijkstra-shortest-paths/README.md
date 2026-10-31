# Dijkstra shortest paths in C++

Dijkstra settles the cheapest frontier distance, rather than the first edge that discovers a vertex. A later route can improve a discovered tentative cost. Heap entries contain a copied distance; when a popped entry no longer equals the current best, it is stale and must be skipped.

```cpp
using Entry=std::pair<Int,Int>; // cost, vertex
std::priority_queue<Entry,std::vector<Entry>,std::greater<>> frontier;
```

Nonnegative weights ensure a settled cheapest route cannot be improved through a more expensive unsettled frontier. A negative edge invalidates that proof, even when one example happens to work. Zero-cost cycles and parallel edges are valid; enqueue only strict improvements to avoid endless cycling. Optional distances represent unreachable vertices without arithmetic on infinity. The heap implementation uses O((V+E) log(V+E)) time and O(V+E) storage with lazy stale entries. Validate the complete graph before indexing or starting relaxation.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Directed nonnegative weighted edges, parallel edges/self-loops/zeros valid. Return minimum Int costs, source 0 and unreachable nullopt. Reject n<=0, invalid source/endpoints, negative weight with invalid_argument. Prototype simple paths; final min-heap Dijkstra with stale-entry checks. Preserve edges.

Public signatures:

```cpp

Vec<Opt<Int>> prototype(const Int& n,const Vec<std::tuple<Int,Int,Int>>& edges,const Int& source);
Vec<Opt<Int>> solve(const Int& n,const Vec<std::tuple<Int,Int,Int>>& edges,const Int& source);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
