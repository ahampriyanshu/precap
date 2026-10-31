# Sliding windows with counts in C++

Maintain the distinct-value constraint with frequencies. Removing one `a` from a window containing two occurrences does not remove `a` from its distinct set. Delete a counter only after it reaches zero. After adding a rightmost value, move the left boundary in a loop until validity returns; moving left once may leave three kinds in a two-kind window.

```cpp
std::map<std::string,Int> counts{{"a",2},{"b",1}};
if (--counts["a"] == 0) counts.erase("a"); // a still remains here
```

A discarded start never becomes useful for a later endpoint, because extending a window cannot reduce its distinct count. That monotonic argument permits both boundaries to move forward only, giving expected O(n) work with a hash map. Measure the answer after shrinking. A zero limit is valid and allows only an empty window; a negative limit is a distinct invalid-input case. String labels are compared exactly, including empty strings and case.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Both stages return the longest contiguous length with at most limit distinct strings. Empty labels or limit 0 return 0; negative limit throws invalid_argument. Prototype enumerates ranges; final uses one window and frequency map, expected O(n) time. Preserve input.

Public signatures:

```cpp

Int prototype(const Vec<std::string>& labels,const Int& limit);
Int solve(const Vec<std::string>& labels,const Int& limit);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
