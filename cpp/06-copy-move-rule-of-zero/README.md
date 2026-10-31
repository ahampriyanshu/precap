# Copy, move, and the rule of zero

Copy and move are operations chosen by an expression's value category and the available overloads. `std::move` is a cast that permits move overload selection; it does not itself transfer a byte. A const object usually cannot call a normal `T(T&&)` move constructor, so moving it may copy instead.

```cpp
std::vector<Int> original{1,2,3};
auto copy=original;           // independent element storage
auto owner=std::move(copy);  // permits ownership transfer
// copy is valid; use only operations whose preconditions still hold.
```

Moved-from standard containers remain valid but their exact state is generally unspecified. Do not build an API around an assumed empty source unless the API establishes that explicitly. References to transferred vector elements may remain tied to the transferred allocation, but invalidation rules depend on the operation and allocator; document which addresses matter.

A class made entirely of owning value members often needs no custom destructor, copy, or move operation: the rule of zero. A custom destructor can inhibit implicit move generation; a handwritten copy of a raw owning pointer can cause double deletion. Prefer vector/string/unique_ptr members to manual arrays. Unique ownership naturally disables copying; value vectors naturally deep-copy their elements.

```cpp
struct Packet {std::vector<Int> values;}; // member semantics compose
static_assert(std::is_copy_constructible_v<Packet>);
static_assert(std::is_move_constructible_v<Packet>);
```

Use a by-value parameter when the function needs an owned working copy and callers may choose to copy or move into it. The final exercise drains a prefix of packets: transfer each inner vector's allocation, then erase the consumed outer entries. Validate the count before any move, so invalid requests leave all inner contents unchanged. The outer erase invalidates references to moved/shifted Packet objects even though transferred inner Int buffers remain owned by the result.

## Practice

Prototype takes Packet by value, appends extra, returns the owned result; an lvalue caller remains unchanged. Final drains exactly count packets from the front of source into a returned vector in order. Require 0<=count<=source.size(), otherwise invalid_argument before mutation. Transfer each nonempty inner vector allocation without copying Int elements; remaining packets preserve order/content. count zero changes nothing; draining all empties source. Return values own independent contents. Outer Packet references may be invalidated.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

```cpp
struct Packet {Vec<Int> values;bool operator==(const Packet&)const=default;};
inline Packet prototype(Packet packet,Int extra);
inline Vec<Packet> solve(Vec<Packet>& source,Int count);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
