# Values, initialization, and control flow

A C++ object has a type, storage, a lifetime, and a current value. `int count;` at block scope leaves count uninitialized; reading it is not a random-number API. Prefer `int count{};` when zero is a meaningful initial state, or initialize directly with the value establishing the invariant. Braces reject narrowing that parentheses and implicit conversion may accept.

```cpp
int count{};             // initialized zero
long long bytes{4096};
auto ratio = 5 / 2;      // int, value 2
// int truncated{3.5};   // ill-formed narrowing
```

`auto` deduces a type; it does not select a type based on the value's future use. Integer division happens before assignment to a floating variable. Signed arithmetic overflow is undefined behavior, while unsigned arithmetic wraps modulo its range. Mixing a negative integer with `size_t` can convert the negative value to a huge positive number. Validate signed data before treating it as an index.

Control flow should establish a fact used by the next statement. `if(optional)` checks presence, so an optional containing zero is true. A loop that consumes digits should preserve the invariant that its accumulator represents exactly the consumed prefix. Check bounds before multiply/add, rather than computing an overflowing result and checking afterward.

```cpp
std::optional<Int> maybe_zero{0};
if (maybe_zero) { /* value exists, even though *maybe_zero == 0 */ }
```

Decimal parsing also exposes the difference between lexical policy and numeric range. Decide whether signs, whitespace, empty strings, and leading zeroes are accepted. Library parsing is useful in application code, but implementing a small strict parser makes each control-flow decision visible. In the final exercise the negative minimum has one greater magnitude than the positive maximum; accumulating only into a positive signed Int rejects that legitimate endpoint. An unsigned magnitude or negative accumulator can model it safely.

## Practice

Prototype: classify an Int as exactly "negative", "zero", or "positive". Final: parse a nonempty ASCII decimal string with an optional leading + or -, at least one digit, no whitespace or separators, and no trailing data. Leading zeroes are valid. Return nullopt for lexical or Int range failure; do not throw. Accept both Int endpoints and negative zero. Do not call a library integer parser in this exercise.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

```cpp

inline std::string prototype(Int value);
inline Opt<Int> solve(std::string_view input);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
