# Bellman–Ford shortest paths in C++

Bellman-Ford relaxes every edge repeatedly. A shortest simple path uses at most V-1 edges, so V-1 complete passes suffice when no reachable negative cycle exists. A further possible improvement witnesses such a cycle. An early pass with no change proves later passes cannot help.

```cpp
std::optional<Int> unreachable;
// Relax (u,v,w) only when distance[u] is engaged.
```

An unreachable negative cycle is irrelevant to a single-source result. Relaxing from a numeric infinity sentinel can accidentally make it appear reachable after subtracting a negative weight. Optional reachability prevents that mistake. Parallel edges and self-loops need no special selection logic; a negative reachable self-loop is a cycle witness. O(VE) runtime is slower than Dijkstra but permits negative weights. Retain exact signed costs and do not substitute floating-point infinity for finite integer answers. The prototype may enumerate simple paths and separately inspect reachable cycles, because path enumeration alone cannot detect unbounded improvement.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Directed integer weights may be negative. Return minimum costs with nullopt unreachable. n<=0, invalid source/endpoints, or source-reachable negative cycle throws invalid_argument. Unreachable negative cycles do not throw. Prototype paths plus reachable-cycle inspection; final V-1 relaxations and cycle pass. Preserve edges.

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
