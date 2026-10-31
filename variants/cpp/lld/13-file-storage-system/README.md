# File Storage System in C++

Expiration affects lookup, search, and quota accounting together. Centralize deletion in advance_to so an expired entry releases bytes exactly once. Other operations observe the current logical time and do not read the wall clock.

```cpp
struct File {std::string name;Int size;std::optional<Int> expires_at;};
// A copy preserves expires_at, not a new now+original_ttl deadline.
```

Copying charges the full size again, even when metadata is small. Prepare source metadata before insertion and reject duplicate destinations before changing usage. Check available quota as `size <= quota-used` rather than computing an unchecked projected sum. Zero-byte files still own names and can expire. Value records keep returned metadata isolated. A linear expiration scan is O(N); adding an expiry heap is an optimization that must still handle stale records from deletion or name reuse.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).



## Practice

Inputs have the documented types: names/prefixes are strings; sizes, quota, timestamps, limits, and supplied TTLs are integers. Sizes are bytes; no unit parsing is required. Instances are independent. Every returned value record and list must be fresh. There is no overwrite, filesystem access, or historical rollback.

**Prototype:** implement `FileCatalog()` with `upload()` and `get()`. An empty upload name or negative size raises `std::invalid_argument`. Duplicate names return `false` and retain their size. Otherwise upload returns `true`. Zero-byte files are valid. Missing get returns `nullopt`. The prototype has no quota or expiration.

**Final:** implement `FileStorage(quota)`:

- Negative quota raises `std::invalid_argument`; zero is valid. Start at logical time 0 with usage 0.
- `advance_to()`: require timestamp >= current time (and thus nonnegative), otherwise raise `std::invalid_argument` without changing state or time. Equal timestamps are allowed. Set time and remove every entry with `expires_at <= timestamp`, releasing its size exactly once. No other method advances time.
- `upload()`: empty name, negative size, or a supplied TTL below 1 raises `std::invalid_argument` before other checks. Omitted TTL means no expiration. Return `false` for an existing name or insufficient quota, unchanged. On success store expiry `current_time + ttl` or `nullopt`, charge size, and return `true`.
- `get()`: return exactly the fields declared in the value record below for an existing entry, otherwise `nullopt`.
- `copy()`: empty destination raises `std::invalid_argument` before other checks. Missing source, existing destination (including source == destination), or insufficient quota returns `false` unchanged. Success creates distinct metadata with the same size and absolute expiry as the source, charges the full size again, and returns `true`.
- `erase()`: return `true` and release the size if present; return `false` if absent. Repeated deletion must not release space twice.
- `usage()`: return the total sizes of all current entries.
- `search()`: match case-sensitive `name.starts_with(prefix)`. Empty prefix matches all. Sort by size descending then name ascending, return at most `limit` snapshots. Negative limit raises `std::invalid_argument` without mutation; zero returns `[]`.

Rejected calls leave all entries and quota accounting unchanged.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp
struct File {std::string name;Int size;Opt<Int> expires_at;bool operator==(const File&)const=default;};
class FileCatalog { public:
 FileCatalog();
 bool upload(const std::string& name,Int size);
 Opt<Int> get(const std::string& name) const;
};
class FileStorage { public:
 explicit FileStorage(Int quota);
 void advance_to(Int ts);
 bool upload(const std::string& name,Int size,Opt<Int> ttl=std::nullopt);
 Opt<File> get(const std::string& name) const;
 bool copy(const std::string& source,const std::string& destination);
 bool erase(const std::string& name);
 Int usage() const;
 Vec<File> search(const std::string& prefix,Int limit=10) const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
