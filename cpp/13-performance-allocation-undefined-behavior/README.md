# Performance, allocation, and undefined behavior

Optimization starts with an observable workload and a correct contract. Big-O distinguishes growth rates but does not capture allocation count, cache locality, branch behavior, or ownership copying. A contiguous vector scan can beat a pointer-heavy structure despite equal asymptotic complexity. Measure realistic sizes and distributions using an optimized build, and separate setup from the timed operation.

```cpp
std::vector<Int> values;
values.reserve(1000); // capacity changes, size remains zero
// values[0]=1;       // invalid: reserve did not construct element zero
values.push_back(1); // now element zero exists
```

Size describes live elements; capacity describes allocated storage. Repeatedly reserving size+1 can defeat geometric growth and produce quadratic copying. Reserve once when a useful bound is known. Erasing elements retains vector capacity, enabling later reuse, but pointers/references to erased elements are invalid. A shrink-to-fit request is nonbinding and is not a routine end-of-operation cleanup policy.

Undefined behavior invalidates reasoning about output. Examples include signed overflow, out-of-bounds indexing, dereferencing a dangling pointer, unsequenced conflicting updates, and violating object lifetime or aliasing rules. A successful test run does not prove absence of UB, while a sanitizer can only diagnose executed cases. Use checked preconditions, const borrowing, and owning standard containers to make valid operations easier to express.

```cpp
std::size_t write=0;
// During stable compaction write never exceeds the current read position.
// Assign retained elements forward, then resize once after reading finishes.
```

For stable in-place filtering, maintain a write cursor marking the retained prefix. Reading each element before possibly overwriting an earlier slot preserves unprocessed data. Removing by repeated vector.erase shifts suffixes repeatedly and can become O(n²). The final exercise must compact in O(n) time/O(1) auxiliary state while retaining the allocation. Tests can check content, order, capacity and surviving storage identity; they cannot prove asymptotic complexity by themselves. The algorithm's invariant supplies that argument.

## Practice

Prototype returns an owned stable copy of nonnegative values; preserve input. Final removes negative values in place, preserving retained order and duplicates, and returns the number removed. Use O(n) time, O(1) auxiliary state, no replacement allocation, and retain original vector capacity. All/none/empty removal are valid. Existing observers to erased/moved logical elements have no preservation guarantee; data allocation itself remains unchanged when original capacity is nonzero. Do not shrink_to_fit.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

```cpp

inline Vec<Int> prototype(const Vec<Int>& values);
inline Int solve(Vec<Int>& values);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
