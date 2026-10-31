# Errors, exceptions, and resource guarantees

Use absence for an expected missing result, exceptions for a documented invalid request or failed operation, and a value type when callers need structured error detail. C++20 has optional and variant; `std::expected` is a later standard feature and is not assumed here. Do not use a valid value such as zero as an undocumented error sentinel.

```cpp
std::optional<Int> find_balance(std::string_view id); // absent account is ordinary
// Invalid amounts throw std::invalid_argument before the account lookup.
```

Exceptions unwind stack frames, destroying fully constructed local owners. Catch by const reference to avoid slicing and unnecessary copies. A destructor normally must not allow an exception to escape. `noexcept` is a commitment: if an exception escapes it, the process terminates. It is not a request to ignore failures.

The basic guarantee preserves valid invariants and avoids resource leaks after failure. The strong guarantee leaves observable state unchanged. A no-throw guarantee promises no escaping exceptions. A function can provide the strong guarantee by constructing a candidate value and committing with a nonthrowing swap only after all validation and potentially failing transformation finishes.

```cpp
auto candidate=current; // may allocate; current remains untouched
// mutate and validate candidate
current.swap(candidate); // commit after success
```

Validate-before-write is sufficient when all later operations cannot fail. It is insufficient if allocation, callbacks, or external work can throw halfway through mutation. Consider those failure points when claiming atomicity. The exercise's injected callback failure deliberately occurs after one candidate update. Catching the error without restoring live state would fail the contract. Copy-and-commit costs O(n) additional storage, an explicit tradeoff that can later be replaced by an undo log when workload evidence warrants it.

## Practice

Prototype safely reads one index, returning nullopt outside [0,size). Final applies Change{index,delta} entries in order to a candidate vector and calls after_change(index) after each candidate write. Invalid index or Int overflow throws invalid_argument; callback exceptions propagate unchanged. All failures leave values exactly unchanged. Successful calls commit all changes together. Callback is supplied and callable, must not mutate values/changes or retain candidate references; arithmetic is checked before addition. Empty batch succeeds with no callbacks.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

```cpp
struct Change {Int index,delta;};
inline Opt<Int> prototype(const Vec<Int>& values,Int index);
inline void solve(Vec<Int>& values,const Vec<Change>& changes,const std::function<void(Int)>& after_change);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
