# Binary search trees in C++

A BST maintains every left key smaller and every right key larger. Floor search retains the latest key not exceeding the query: a too-large node rules out its right subtree; an eligible node permits a larger answer only in its right subtree. Search and updates take O(h), with h potentially n in an unbalanced tree.

```cpp
using Result=std::variant<bool,Int,std::monostate>;
Result changed=true;
Result floor=Int{3}; // preserve the distinction between bool and integer
```

Deletion with two children can replace a key with its inorder successor, then remove that successor in the right subtree. Owning `unique_ptr` links make subtree replacement explicit and avoid leaks. Duplicate add is a no-op, and removing a missing key is false. An unsorted unique list is a useful prototype because its behavior can be compared independently. The final exercise asks for an actual BST, rather than delegating to `std::set`; tests verify results but a complexity claim still requires reviewing structure.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Start empty; commands add/remove/contains return bool, floor returns greatest key<=query or absence. One result per command; unknown op throws invalid_argument. Result is variant<bool,Int,monostate>, where monostate is absent floor. Prototype unsorted unique list; final implement BST deletion/floor. Preserve commands.

Public signatures:

```cpp

Vec<std::variant<bool,Int,std::monostate>> prototype(const Vec<std::pair<std::string,Int>>& commands);
Vec<std::variant<bool,Int,std::monostate>> solve(const Vec<std::pair<std::string,Int>>& commands);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
