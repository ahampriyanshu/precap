# Functions, overloads, templates, and concepts

A function signature defines argument types and ownership boundaries. Passing a large vector by value copies it; passing by const reference borrows it; passing by value can also be appropriate when the function intends to take ownership. Return a value for independently owned results and rely on normal return-value optimization rather than returning a reference to a local.

```cpp
Int sum(std::span<const Int> values); // borrows any compatible contiguous sequence
void consume(std::vector<Int> values); // owns its parameter copy/move
```

Overload resolution chooses among viable signatures using conversion rankings. A generic overload can unexpectedly beat a non-template if it requires fewer conversions. Templates deduce types from expressions, not from runtime values. A constraint documents admissible operations and removes invalid candidates before instantiating a body; it cannot prove every semantic precondition.

```cpp
template<class T>
concept ArithmeticInteger=std::integral<T> && !std::same_as<T,bool>;
// bool is integral in the type system, but is not meaningful for checked addition here.
```

A generic checked addition must account for different signedness. Unsigned overflow is detectable with `a > max-b`; for signed types, split on the sign of b and compare against max-b or min-b before adding. Computing a+b first already invokes undefined behavior for a signed overflow, so a later comparison is too late. Integer promotions also mean a narrow expression can have type int; explicitly return the chosen T only after proving the mathematical result is representable.

Header-defined templates must be visible at their instantiation sites. `inline` can resolve ordinary header function linkage, but does not mean the compiler must inline machine code. Keep constraints on the public declaration and implementation consistent.

## Practice

Prototype: checked Int addition returning nullopt on overflow. Final: implement the constrained solve<T>(T,T) for every integral T except bool, returning optional<T> and nullopt when the mathematical sum is outside T range. Preserve the ArithmeticInteger constraint. No floating-point inputs or mixed-type overload are required. Validate before any overflowing signed arithmetic.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

```cpp
template<class T> concept ArithmeticInteger = std::integral<T> && !std::same_as<T,bool>;
inline Opt<Int> prototype(Int a,Int b);
template<ArithmeticInteger T> Opt<T> solve(T a,T b);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
