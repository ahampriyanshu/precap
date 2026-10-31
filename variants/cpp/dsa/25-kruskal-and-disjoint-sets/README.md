# Kruskal and disjoint sets in C++

Kruskal chooses the cheapest edge joining different current components. A disjoint-set structure answers that connectivity question without repeatedly traversing the accepted forest. Path compression shortens future find paths; union by size bounds tree growth.

```cpp
// Canonical edge key is (weight,min_endpoint,max_endpoint),
// while the returned edge record remains (min_endpoint,max_endpoint,weight).
```

This distinction between storage format and sort key is observable when weights tie. Normalize orientation before sorting, and append edges in acceptance order. Self-loops always connect a component to itself. Negative costs are valid because the cycle-cut argument does not require positive weights. A connected n-vertex tree needs n-1 accepted edges; otherwise return absence rather than a minimum spanning forest. Validate endpoints even when n is zero or one. Sorting dominates at O(E log E), with almost-constant amortized DSU operations.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Undirected weighted edges, negatives allowed. Normalize endpoints, process by (weight,min,max), reject cycles/self-loops, return (total,edges) in acceptance order or nullopt disconnected. n=0 or 1 returns (0,[]) for valid edges. Negative n/invalid endpoints throw invalid_argument. Prototype connectivity traversals; final DSU compression/union-by-size. Preserve edges.

Public signatures:

```cpp

Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>> prototype(const Int& n,const Vec<std::tuple<Int,Int,Int>>& edges);
Opt<std::pair<Int,Vec<std::tuple<Int,Int,Int>>>> solve(const Int& n,const Vec<std::tuple<Int,Int,Int>>& edges);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
