# Classes, invariants, and RAII

A class is useful when every public operation must preserve a relationship among values. Constructors establish the invariant before an object becomes usable; methods preserve it. A public data struct is appropriate for an unconstrained snapshot, while mutable service state generally belongs behind methods.

```cpp
class PositiveLimit {
 Int value_;
public:
 explicit PositiveLimit(Int value):value_(value) {
  if(value<=0) throw std::invalid_argument("limit");
 }
 Int value() const {return value_;}
};
```

Member initialization follows declaration order, not the order written in the initializer list. Initialize members directly rather than default-constructing and assigning later. `explicit` prevents an unintended implicit conversion from an integer into a domain object.

RAII ties resource release to an owner's destructor. Stack unwinding destroys fully constructed local objects when an exception exits a scope. A `lock_guard` releases its mutex on both normal return and exception; a vector destroys its elements and frees its allocation automatically. Destructors should not throw during cleanup, because a second escaping exception during unwinding terminates the process.

```cpp
std::mutex mutex;
{
 std::lock_guard lock(mutex); // released at closing brace, including exception exit
}
```

Model a bounded stock invariant as `0 <= used <= capacity`. A failed reservation must not change used. Avoid overflow by checking requested against capacity-used. Releasing more than currently reserved is invalid and leaves state unchanged. The final practice uses a local reservation guard so returning from any scope restores stock. Its owner must outlive the guard; a borrowed reference does not provide lifetime extension. This makes ownership of the reservation explicit without implementing manual try/catch cleanup at every call site.

## Practice

Implement Stock in BOTH stages: nonnegative capacity, used initially zero, reserve(amount>=0) returns false unchanged when insufficient, release(amount) requires 0<=amount<=used, snapshot returns values. Prototype constructs a stock and attempts reservations in order, ignoring capacity failures. Final solve borrows an existing Stock, reserves amount, and if accepted uses a scope guard to release it on every exit. If fail_inside is true after a successful reservation, throw runtime_error; a capacity failure does not throw. On successful normal return, return the snapshot observed inside the reservation, then release before the caller resumes. An invalid amount throws invalid_argument unchanged. Stock must outlive the scope guard.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

```cpp
struct ReservationSnapshot {Int capacity,used;bool operator==(const ReservationSnapshot&)const=default;};
class Stock { public:
explicit Stock(Int capacity);
bool reserve(Int amount);
void release(Int amount);
ReservationSnapshot snapshot() const;
};
inline ReservationSnapshot prototype(Int capacity,const Vec<Int>& reservations);
inline ReservationSnapshot solve(Stock& stock,Int amount,bool fail_inside);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
