# Linked lists and node identity in C++

Filtering values and relinking nodes have different identity contracts. A new vector can reproduce values but cannot preserve the addresses of existing list nodes. Here each node exclusively owns its successor through `unique_ptr`. Removing a node must transfer its successor's ownership into the link that used to own it.

```cpp
auto node=std::make_unique<Node>(7);
Node* observed=node.get(); // observer; never delete through this pointer
// Moving node transfers ownership while observed continues to identify the allocation.
```

A pointer to an owning link can express head removal and interior removal uniformly. Move the discarded node into a temporary owner before moving its successor, so destruction never reads a member of an already destroyed object. Raw pointers in tests observe identity; they do not own memory and are invalid after their observed node is removed. Unique ownership deliberately differs from a garbage-collected node model: removal destroys excluded nodes. Survivors must retain both address and relative order. The final result owns all retained nodes and ends in null.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

prototype and solve return surviving values in original order, excluding all blocked values; preserve both vectors. Also implement `detach(std::unique_ptr<Node> head, const std::set<Int>& blocked)` in BOTH stages. Transfer ownership, relink existing nodes, preserve survivor addresses and order, destroy removed nodes, and return null for no survivors. No replacement survivor allocations or cycles. Node observers are valid only while their node survives.

Public signatures:

```cpp

Vec<Int> prototype(const Vec<Int>& values,const Vec<Int>& blocked);
Vec<Int> solve(const Vec<Int>& values,const Vec<Int>& blocked);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
