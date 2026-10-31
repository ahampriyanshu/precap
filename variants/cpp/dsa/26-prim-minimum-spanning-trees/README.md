# Prim minimum spanning trees in C++

Dense Prim maintains each unselected vertex's cheapest edge into the selected set. Repeatedly choose the lowest frontier cost, add that vertex, then improve remaining frontier entries using its matrix row. This grows a tree directly instead of sorting every matrix edge.

```cpp
std::vector<std::optional<Int>> frontier(costs.size());
frontier[0]=0; // root contributes no edge cost
```

An absent frontier means disconnected, not expensive. Zero and negative edge costs must remain legitimate candidates. The diagonal does not contribute an edge to the tree, but matrix shape and symmetry are validated before ignoring diagonal values. Copying matrix rows unnecessarily doubles already quadratic storage; retain const references and use O(V) extra arrays. Scanning V frontier entries V times gives O(V²) work, which is appropriate for dense input. A sparse heap representation addresses a different storage choice.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Input square symmetric matrix, optional cost means no edge; zero/negative costs allowed. Validate shape and symmetry including diagonal shape before ignoring diagonal edges. Return MST total or nullopt disconnected; [] returns 0. Invalid matrix throws invalid_argument. Prototype convert to edges/MST; final dense O(V²) Prim/O(V) auxiliary memory. Preserve every row.

Public signatures:

```cpp

Opt<Int> prototype(const Vec<Vec<Opt<Int>>>& costs);
Opt<Int> solve(const Vec<Vec<Opt<Int>>>& costs);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
