# Floyd–Warshall all-pairs shortest paths in C++

Floyd-Warshall increases the allowed intermediate vertex set one vertex at a time. With k outside the other two loops, `distance[i][j]` can improve through `i -> k -> j` while preserving the dynamic-programming meaning of each phase.

```cpp
// Only combine two engaged costs; absence is not zero.
if(d[i][k] && d[k][j]) { /* consider *d[i][k] + *d[k][j] */ }
```

Initialize the diagonal to zero and retain the cheapest parallel edge. A negative self-loop must still override zero, because it witnesses a negative cycle. Any negative diagonal after relaxation indicates an unbounded cycle anywhere in the graph, even in a component unreachable from some chosen source. This differs from single-source Bellman-Ford's error scope. The matrix requires O(V²) storage and O(V³) time. Using i or j as the outer phase generally loses the recurrence's invariant.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Return n*n directed minimum-cost matrix with zero diagonal and nullopt unreachable; keep cheapest parallel edge. n=0 yields empty. Negative n, invalid endpoints, or ANY negative cycle throws invalid_argument. Prototype Bellman-Ford per source; final Floyd-Warshall O(V^3)/O(V^2). Preserve edges.

Public signatures:

```cpp

Vec<Vec<Opt<Int>>> prototype(const Int& n,const Vec<std::tuple<Int,Int,Int>>& edges);
Vec<Vec<Opt<Int>>> solve(const Int& n,const Vec<std::tuple<Int,Int,Int>>& edges);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
