# Stacks and nested operations in C++

A stack records operations that have opened but have not yet closed. A matching unload removes the most recent open label. Equality with any older label is insufficient: LOAD:a, LOAD:b, UNLOAD:a is an ordering violation even though a exists.

```cpp
std::vector<std::string> pending{"a","b"};
// Only pending.back()=="b" may close now.
```

Validation order is part of this streaming contract. Parse a token only when it is reached. Once an ordering violation is detected, return false without looking ahead at later malformed tokens. Conversely, a malformed reached token is an exception, not an ordinary mismatch. Find exactly one colon, require an exact LOAD or UNLOAD command, and require a nonempty label. End-of-input succeeds only when the stack is empty. Adjacent cancellation is a possible prototype, but must retain the same left-to-right failure behavior. The stack implementation costs O(n) operations plus the text read, and stores at most the nesting depth.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Each reached token must be exactly LOAD:<nonempty-label> or UNLOAD:<nonempty-label>, with exactly one colon. Malformed reached tokens throw invalid_argument. Return false immediately for an unload mismatch without inspecting later tokens; [] is true and unmatched loads at end are false. Prototype may reduce adjacent pairs; final uses a stack. Preserve tokens.

Public signatures:

```cpp

bool prototype(const Vec<std::string>& tokens);
bool solve(const Vec<std::string>& tokens);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
