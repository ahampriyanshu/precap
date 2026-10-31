# Dynamic programming: minimum coins in C++

Greedy denomination choice fails for sizes 1,3,4 and amount 6: choosing 4 first uses three coins, while 3+3 uses two. Minimum-coins DP asks which final coin completed each smaller amount. The answer for amount a depends on already solved amounts a-c.

```cpp
std::vector<Int> best(7,7); // 7 is unreachable sentinel for target 6
best[0]=0; // no coins are needed to make zero
```

Only extend reachable states; do not add one to an unbounded numeric infinity. Positive sizes ensure dependencies point to smaller amounts and recursion terminates. Zero size would create a self-dependency, so validation is not cosmetic. Duplicate sizes change work but not the answer. The recurrence computes O(amount*count) transitions and needs O(amount) memory. The uncached recursive prototype revisits overlapping subproblems and can be exponential; compare behavior on small inputs before considering performance.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

## Practice

Unlimited positive sizes; return fewest coins totaling amount or -1 if impossible. amount 0 returns 0 even with no sizes. Negative amount or any size<=0 throws invalid_argument. Prototype uncached recursion; final O(amount*size_count) DP/O(amount) memory. Preserve sizes.

Public signatures:

```cpp

Int prototype(const Vec<Int>& sizes,const Int& amount);
Int solve(const Vec<Int>& sizes,const Int& amount);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
