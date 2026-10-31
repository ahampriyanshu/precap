# Ownership, smart pointers, and weak observers

`unique_ptr<T>` owns exactly one allocation and transfers ownership by move. `shared_ptr<T>` co-owns an allocation through a control block; copying it extends lifetime, but does not make T's mutable state thread-safe. A raw pointer is an observer, while `weak_ptr` is an observer that can test and safely acquire shared lifetime.

```cpp
auto strong=std::make_shared<std::string>("resource");
std::weak_ptr<std::string> observer=strong;
auto borrowed_owner=observer.lock(); // one atomic lifetime acquisition
```

Do not call expired() and then assume a raw pointer remains alive: another owner may disappear between check and use. `lock()` combines the check and acquisition. Shared-pointer cycles retain each other even after outside owners vanish; choose weak back-links when a relationship must not own its parent. Avoid constructing two shared_ptr control blocks from the same raw pointer, which creates two independent deleters for one allocation.

A cache that stores shared_ptr retains resources forever until eviction. A weak cache permits reuse while some caller owns a resource, but does not itself prolong the resource lifetime. Expired weak entries may retain small control-block metadata until pruned; they do not retain the resource object. Identity is observable: acquiring the same live key should return the same allocation, while a key whose last owner vanished may produce a new allocation. Never assert the new address differs, because an allocator may reuse freed storage.

```cpp
std::map<std::string,std::weak_ptr<Resource>> cache;
// Reacquire with lock(); create a fresh shared owner only when acquisition fails.
```

The exercise is sequential. Sharing control blocks across threads is supported, but concurrently mutating the same map still requires synchronization. Prefer explicit ownership in signatures: clone accepts a const reference and returns a new unique owner; acquire returns shared ownership.

## Practice

Prototype clones a Resource into a new unique_ptr with copied id/values. Final ResourceCache.acquire requires a nonempty ID, returns the existing shared allocation while alive or creates a Resource{id,{}} when no live owner exists. Cache entries are weak owners: dropping all caller owners must destroy the Resource. prune removes expired entries and returns the number removed, slots reports retained weak entries. Invalid acquire leaves state unchanged. Independent caches do not share resources.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

```cpp
struct Resource {std::string id;Vec<Int> values;};
inline std::unique_ptr<Resource> prototype(const Resource& source);
class ResourceCache { public:
ResourceCache();
std::shared_ptr<Resource> acquire(const std::string& id);
Int prune();
Int slots() const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
