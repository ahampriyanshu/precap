# Transactional Key-Value Store in C++

Nested commit closes one boundary; it does not make a change durable outside every enclosing transaction. A committed child merges into its immediate parent, so an outer rollback must still undo it. A stack of full value-map snapshots is a simple correct design for small data.

```cpp
std::vector<std::map<std::string,std::string>> views(1);
// begin copies views.back(); rollback discards only the top view.
```

An overlay design can reduce copying, but deletion needs a tombstone distinct from absence: otherwise lookup falls through to a deleted parent value. Empty strings are actual stored values and cannot serve as absence markers. Use optional string results. Return snapshots by value and sorted map keys for deterministic prefix views. Invalid commit/rollback at depth zero must preserve both data and depth. Copying a full view costs O(number of keys), a deliberate tradeoff for an auditable first implementation.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).



## Practice

Keys, values, and prefixes are strings; empty strings are valid. Values are never `nullopt`. Everything stays in memory. There are no clocks, threads, persistence, or input type conversions.

**Prototype:** implement `KeyValueStore()` with independent storage. `set(key, value)` inserts or replaces and returns `nullopt`; `get(key)` returns its string value or `nullopt`; `erase(key)` returns `true` if it removed a key and `false` otherwise. Deleting and recreating a key is valid.

**Final:** implement `TransactionalStore()` with the same `set`, `get`, and `delete` behavior plus:

- `begin()`: start a nested transaction from the current visible state and return the new depth.
- `commit()`: merge only the innermost transaction into its immediate parent, close that transaction, and return the new depth. An outer rollback must still undo an inner commit.
- `rollback()`: discard only the innermost transaction, close it, and return the new depth.
- `depth()`: return zero for the base view, one after a single unmatched `begin()`, and so on.
- `snapshot()`: return a fresh value record of the currently visible keys starting with the case-sensitive prefix, inserted into the result in ascending key order. An empty prefix includes every key. Mutating the result must not affect any transaction or base view.

Calling `commit()` or `rollback()` at depth zero raises `std::logic_error` and preserves the visible state and depth. Reads see all edits in the innermost view, including uncommitted writes and deletions. Duplicate `set` replaces a value. Separate instances share no state.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp

class KeyValueStore { public:
 KeyValueStore();
 void set(const std::string& key,const std::string& value);
 Opt<std::string> get(const std::string& key) const;
 bool erase(const std::string& key);
};
class TransactionalStore { public:
 TransactionalStore();
 void set(const std::string& key,const std::string& value);
 Opt<std::string> get(const std::string& key) const;
 bool erase(const std::string& key);
 Int begin();
 Int commit();
 Int rollback();
 Int depth() const;
 std::map<std::string,std::string> snapshot(const std::string& prefix="") const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
