# LRU Cache in C++

Recency is an ordering of accesses, not insertion timestamps. A hit and an update both move a key to the most recent end. A miss changes nothing. Separate value lookup from recency links so evicting the oldest entry removes both representations.

```cpp
std::list<std::pair<std::string,Int>> order;
// list::splice moves a node without invalidating its iterator.
```

A hash map to list iterators supports expected O(1) operations; vector erasure or list-only scans are useful baselines but remain O(n). Iterator validity is part of the design: erasing a node invalidates the stored iterator for that key. Capacity zero should accept validated puts as no-ops. Return `items()` by value rather than exposing the list, so users cannot corrupt ordering. If using map-to-iterator state, default copying a cache is unsafe because copied iterators still target the original list; disable copying or rebuild the index.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

The C++ cache stores Int values and its optional fallback is also Int. This deliberately narrows an arbitrary-object default to a statically typed optional; absence remains distinct from any stored integer.

## Practice

**Prototype:** implement `touch_order(keys, key)`. Assume `keys` contains distinct nonempty strings and `key` is a nonempty string. Return a fresh list in oldest-to-newest order, moving an existing key to the end or appending a missing key. Do not mutate `keys`. There is no capacity limit at this stage.

**Final:** implement `LRUCache(capacity)`. Capacity must be a nonnegative integer, within the declared C++ numeric type; invalid capacity raises `std::invalid_argument`. Keys must be nonempty strings. Stored values must be integers within the declared C++ numeric type; negative values are valid. Invalid keys or stored values raise `std::invalid_argument` before any state or order change.

`put(key, value)` returns `nullopt`, inserts or updates the value, and makes the key most recent. Evict the least recent key only if needed. At zero capacity, valid puts are no-ops. `get(key, default=nullopt)` returns the value and refreshes recency on a hit; a miss returns the supplied default without changing state. Defaults may be any object. `erase(key)` returns `true` if removed and `false` if absent; it does not refresh other keys. `items()` returns a fresh list of `(key, value)` tuples ordered least recent first. Instances own independent state. Repeated updates occupy one entry.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp

inline Strings touch_order(const Strings& keys,const std::string& key);
class LRUCache { public:
 explicit LRUCache(Int capacity);
 void put(const std::string& key,Int value);
 Opt<Int> get(const std::string& key,Opt<Int> fallback=std::nullopt);
 bool erase(const std::string& key);
 Vec<std::pair<std::string,Int>> items() const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
