# References, pointers, const, and lifetimes

A reference is an alias to an existing object; binding one does not create a new owner or extend every possible lifetime. A pointer can be null and reseated. Neither a raw pointer nor a span automatically keeps its target alive. `const T*` prevents mutation through that pointer; it does not promise some other alias cannot mutate the same object.

```cpp
std::vector<Int> values{4,5,6};
std::span<const Int> view(values);
const Int* observer=&values[1];
values[1]=9; // observer and view now observe 9
```

`Int* const` is a fixed pointer to mutable Int; `const Int*` is a mutable pointer to const-accessed Int. Top-level const on a copied parameter does not constrain a caller's object. Const correctness describes access paths, not ownership. A function returning a pointer or view must state whose storage it borrows and what invalidates that storage.

```cpp
// Dangling: returns a view into a vector destroyed on return.
// std::span<const Int> wrong() { std::vector<Int> v{1}; return v; }
```

Returning a span into the original input permits zero-copy slices, but transfers lifetime obligations to the caller. Vector reallocation, erasure of covered elements, or destruction invalidates the result. Passing a temporary vector to a borrowing API can therefore produce a dangling result after the full expression. A copy would be safer for long-lived independent data; a view is useful when the caller controls a clear enclosing lifetime.

The exercises check addresses and aliasing while owners are still alive. They deliberately never dereference a dangling pointer: undefined behavior is not a reliable test assertion. Empty spans need special care because their data pointer may be null, so avoid blindly forming pointer arithmetic on it.

## Practice

Prototype: return a const observer pointer to the first value equal to needle, or nullptr. Final: return an optional borrowed span covering the first exact contiguous needle in values. Empty needle returns an engaged empty span at the input start, including empty input. No match returns nullopt. Preserve input and allocate no replacement sequence. The caller must keep input storage alive and stable for the returned observer/view lifetime.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

```cpp

inline const Int* prototype(std::span<const Int> values,Int needle);
inline Opt<std::span<const Int>> solve(std::span<const Int> values,std::span<const Int> needle);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
