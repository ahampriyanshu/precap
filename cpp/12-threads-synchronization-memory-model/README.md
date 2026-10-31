# Threads, synchronization, and the memory model

A data race occurs when conflicting accesses to the same memory location happen concurrently without synchronization and at least one writes. It is undefined behavior, not merely a chance of losing increments. `volatile` does not make an increment atomic or publish neighboring data. Protect a multi-field invariant with one mutex spanning the entire read-modify-write operation.

```cpp
std::mutex mutex;
Int accepted=0;
// Every access to accepted must obey the same locking rule.
{ std::lock_guard lock(mutex); ++accepted; }
```

A mutex unlock synchronizes with a later successful lock on the same mutex, creating a happens-before relationship. Condition-variable waiting releases the lock while waiting and reacquires it before checking state. Always wait with a predicate: wakeups can be spurious and a notification is not a retained item of work. The shared predicate is the state; the notification only prompts a recheck.

Atomics provide race-free operations on one object. Relaxed ordering is enough to assign unique work indices with fetch_add when it is not publishing unrelated state. Release/acquire can publish prior writes across threads, but requires a matching protocol; sprinkling atomic flags among unsynchronized containers does not make the containers safe. Independent vector elements can be written by distinct workers after sizing the vector in advance; concurrently push_back-ing to the same vector is different and unsafe.

```cpp
std::atomic<std::size_t> next{0};
auto index=next.fetch_add(1,std::memory_order_relaxed);
// index uniquely assigns an already allocated output slot.
```

A joinable `std::thread` destructor terminates the process, so every started thread needs a join on every exit path, including partial thread-creation failure. `std::jthread` can simplify lifetime management on supported libraries, but this exercise uses portable std::thread. Exceptions escaping a thread function also terminate; capture an exception_ptr, finish joining, and rethrow on the calling thread. Join makes completed worker writes visible to the caller.

Bound concurrency independently of input size. One thread per element can exhaust resources. The final API requires a bounded worker pool and preserves result order by assigning output slots by input index rather than completion order. A callback failure aborts the returned operation, but already started callback side effects cannot be rolled back; document that limit rather than promising a transaction across arbitrary code.

## Practice

Prototype maps transform sequentially in input order. Final maps using at most min(workers,input size) background std::threads, preserves output order and invokes transform exactly once per value on a successful call. workers<=0 throws invalid_argument even for empty input. Empty input invokes no callback. Transform is callable and safe for concurrent use; it may throw. Capture a failure, join ALL started threads, and rethrow a callback exception on the caller thread; no partial result is returned. Input remains unchanged. Do not detach threads. Already performed callback side effects are outside rollback. Standard threads/mutex/atomics only; no wall-clock-dependent result rules.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. No runtime type coercion is required; C++ static types exclude many dynamic-language type errors. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).

```cpp

inline Vec<Int> prototype(const Vec<Int>& values,const std::function<Int(Int)>& transform);
inline Vec<Int> solve(const Vec<Int>& values,Int workers,const std::function<Int(Int)>& transform);
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
