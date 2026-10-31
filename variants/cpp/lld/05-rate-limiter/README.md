# Rate Limiter in C++

Accepted history and observed time are different state. A denied request adds no accepted timestamp, yet must still advance the client's observed clock. Otherwise a later request could travel backward relative to that denial and accidentally restore an earlier quota view.

```cpp
// Active interval is (now-window,now], so equality at the left boundary expires.
bool active = accepted_time > now-window;
```

Keep clocks per client: a busy client's timestamp must not prohibit an unrelated client's smaller timestamp. Validate a complete history before filtering it in the prototype; deleting malformed entries first would hide invalid input. Returning a copy from history() protects internal quotas. The final design can retain a deque and expire from its front for amortized O(1) timestamp removal. No sleep or wall clock belongs in deterministic logical-time tests.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).



## Practice

All timestamps and numeric settings are integers within the declared C++ numeric type. `limit` and `window` must be positive; `now` must be nonnegative. Invalid values raise `std::invalid_argument` before mutation. Time units are arbitrary but must be consistent.

**Prototype:** implement `allow_request(recent, limit, window, now)`. `recent` is a list of previously accepted nonnegative timestamps, in nondecreasing order and no later than `now`; duplicates are valid. Invalid histories raise `std::invalid_argument`. Return `(allowed, new_history)`, filtering to timestamps strictly greater than `now - window`, then appending `now` only when the filtered length is less than `limit`. Do not mutate `recent`; it may contain more than `limit` entries, in which case deny while retaining all unexpired entries.

**Final:** implement `SlidingWindowLimiter(limit, window)`. `allow(client_id, now)` returns a boolean using the same active interval. Client identifiers are nonempty strings; invalid identifiers raise `std::invalid_argument`. A client's timestamps must never move backward, including after a denial; backward calls raise `std::invalid_argument` and leave history and observed time unchanged. Different clients may supply unrelated timestamps. Denials add no accepted timestamp but advance that client's observed time. `history(client_id)` returns a fresh list of accepted timestamps retained after the client's most recent valid `allow` call; it does not advance time or expire anything. An unseen valid client returns `[]`. Keep instances independent.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp

inline std::pair<bool,Vec<Int>> allow_request(const Vec<Int>& recent,Int limit,Int window,Int now);
class SlidingWindowLimiter { public:
 SlidingWindowLimiter(Int limit,Int window);
 bool allow(const std::string& client,Int now);
 Vec<Int> history(const std::string& client) const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
