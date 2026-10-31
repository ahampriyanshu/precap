# Translation units, linkage, builds, and tests

A translation unit is one source file after preprocessing its includes. The compiler checks each translation unit; the linker resolves references across their object files. A declaration states an interface, while a definition supplies storage or behavior. Header guards prevent repeated inclusion inside one translation unit; they do not prevent multiple definitions across different translation units.

```cpp
// config.hpp: declaration
std::string read_name();
// config.cpp: one ordinary out-of-line definition
// std::string read_name() { return "name"; }
```

A non-inline ordinary function defined in a header can violate the one-definition rule when two sources include it. Inline functions may have identical definitions across translation units; template definitions normally need header visibility. `static` at namespace scope gives internal linkage, creating a separate entity in every translation unit, which may be wrong for shared state. Avoid mutable global state as a shortcut around service ownership.

Compiler diagnostics, linker failures, and runtime test failures identify different boundaries. Compile with warnings to expose narrowing, missing returns, and unused results, but do not treat warning absence as a proof of correctness. A debug sanitizer build can catch invalid memory access and undefined arithmetic on executed paths. Optimized builds can expose bugs hidden by a debug layout; undefined behavior is not a stable behavior to test by exact output.

```sh
c++ -std=c++20 -Wall -Wextra -pedantic -pthread main.cpp -o practice
# Optional diagnostic build:
c++ -std=c++20 -g -fsanitize=address,undefined -pthread main.cpp -o practice-debug
```

An executable specification needs named cases, meaningful assertions, explicit exception types, and a nonzero exit status on failure. A process printing PASS without running assertions is not verification. This lesson's header implementation must remain safe to include in multiple translation units. Its parser demonstrates a narrow input grammar rather than relying on environment variables or filesystem state. Tests are deterministic and isolate each fresh configuration load.

## Practice

Prototype parses one line. Trim only ASCII space and tab at each edge. Empty lines or lines whose trimmed first character is # return nullopt. Otherwise split at the FIRST =, trim key and value, require a nonempty key consisting only of ASCII letters/digits/underscore. Empty values and additional = inside a value are valid. Invalid syntax throws invalid_argument. Return owned strings. Final loads lines into an ordered map, ignoring blank/comment lines and rejecting duplicate keys (case sensitive). Preserve input; fresh calls share no state. Keep header definitions inline or otherwise ODR-safe.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

```cpp

inline Opt<std::pair<std::string,std::string>> prototype(std::string_view line);
inline std::map<std::string,std::string> solve(std::span<const std::string> lines);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
