# In-Memory Database in C++

Version selection precedes TTL visibility. Find the last processed version at or before the requested time, then test its lifetime. If that version is expired, return absence; searching backward for an older unexpired value would resurrect overwritten content.

```cpp
struct Version {Int written_at;std::optional<std::string> value;std::optional<Int> expires_at;};
// A null value is a deletion marker, distinct from an empty stored string.
```

Equal timestamps preserve operation order, so historical lookup must prefer the last appended version at that timestamp. Invalid TTL and invalid historical bounds must be checked before accepting logical time. Valid failed conditionals do advance time, even when they add no version. A timeline vector permits binary-search lookups after defining a stable timestamp/order policy. Snapshot scans must consult the same visibility function as point reads to avoid disagreement at expiry boundaries.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).



## Practice

All keys, fields, and values are strings; empty strings are valid and `nullopt` denotes absence. No disk, network, wall time, or threading is needed.

**Prototype:** implement `RecordStore()` with `set()`, `get()`, and `scan()`. Setting replaces an existing field. Scan includes fields starting with the case-sensitive prefix and sorts by field name. Missing records produce `nullopt` or `[]`. Returned lists are fresh snapshots; records and instances are independent.

**Final:** implement `TemporalDatabase()`:

- Every public method takes a nonnegative integer `ts`. Valid calls, including reads and unsuccessful conditional/deletion calls, advance the accepted time. Equal timestamps are allowed; a later call at the same timestamp wins. A smaller timestamp raises `std::invalid_argument` without changing history or accepted time. Booleans and noninteger arguments are outside this exercise's input domain.
- `set()` writes a version. `ttl=nullopt` means no expiration; otherwise `ttl` is a positive integer. A write at `ts` is visible on `[ts, ts + ttl)`. Replacing a field replaces its lifetime too. A nonpositive TTL raises `std::invalid_argument` before any time or state change.
- `get()` reads at `ts`.
- `erase()` appends a deletion marker only when the field is currently visible. Missing or expired fields return `false`.
- `compare_and_set()` writes the new value and lifetime only if the current visible value equals the string `expected`. Missing/expired fields return `false`. TTL validation occurs even if comparison would fail.
- `scan(ts, key, prefix="")` returns a fresh list of visible `(field, value)` tuples, filtered by case-sensitive prefix and sorted by field name.
- `get_at()` reads history at integer `at`, where `0 <= at <= ts`. Invalid `at` raises `std::invalid_argument` without advancing accepted time. Reads before creation, at/after expiration, or after a deletion return `nullopt`. An expired newer version never reveals an older version. History reflects operations already processed; later same-timestamp writes become visible to later calls.

Rejected operations preserve history. All validation errors preserve accepted time as well. Separate instances share nothing.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp

class RecordStore { public:
 RecordStore();
 void set(const std::string& key,const std::string& field,const std::string& value);
 Opt<std::string> get(const std::string& key,const std::string& field) const;
 Vec<std::pair<std::string,std::string>> scan(const std::string& key,const std::string& prefix="") const;
};
class TemporalDatabase { public:
 TemporalDatabase();
 void set(Int ts,const std::string& key,const std::string& field,const std::string& value,Opt<Int> ttl=std::nullopt);
 Opt<std::string> get(Int ts,const std::string& key,const std::string& field);
 bool erase(Int ts,const std::string& key,const std::string& field);
 bool compare_and_set(Int ts,const std::string& key,const std::string& field,const std::string& expected,const std::string& value,Opt<Int> ttl=std::nullopt);
 Vec<std::pair<std::string,std::string>> scan(Int ts,const std::string& key,const std::string& prefix="");
 Opt<std::string> get_at(Int ts,const std::string& key,const std::string& field,Int at);
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
