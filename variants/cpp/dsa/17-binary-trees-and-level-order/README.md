# Binary trees and level-order traversal in C++

A breadth-first frontier contains nodes at exactly one depth. Snapshot the queue's current size before processing the level; children appended during that loop belong to the next level. Iterating until the queue empties inside a level would flatten the whole tree.

```cpp
std::queue<const Tree*> q;
if(root) q.push(root.get());
auto level_size=q.size(); // freeze this before enqueueing children
```

Push left before right to preserve structural order. Names are data, not sort keys. The queue holds observer pointers while the input tree's shared owners keep allocations alive. This lesson uses `shared_ptr` solely to make recursive test fixtures easy to construct and copy; the documented input still has no shared children or cycles. Do not mutate nodes or ownership links. Each node enters once, giving O(n) traversal and O(w) auxiliary memory for the maximum frontier width. Repeated depth scans are an intentionally slower prototype.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Input is a null root or Tree(name,left,right), with unique names, no cycles and no shared child nodes. Return Text names grouped by depth left-to-right. Prototype rescans per depth; final queue O(n) time/O(w) auxiliary space. Preserve structure and names. Public Tree shared owners replace recursive tuple input.

Public signatures:

```cpp

Vec<Vec<Text>> prototype(const std::shared_ptr<Tree>& root);
Vec<Vec<Text>> solve(const std::shared_ptr<Tree>& root);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
