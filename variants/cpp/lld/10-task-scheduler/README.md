# Task Scheduler in C++

A lease token identifies one assignment attempt, not the task itself. After expiry a task returns to pending and may be reassigned to the same worker. Comparing only task and worker would let a stale completion finish the new attempt; compare the current token too.

```cpp
struct LeaseIdentity {Int task_id;Int token;};
// expires_at <= now expires before complete() evaluates the token.
```

Centralize time acceptance and expiration so dispatch, complete, get_task, and active agree at the exact boundary. Validate lease duration before moving time, because a rejected request must not expire unrelated assignments. A valid request returning no work still advances time. Capacity counts running tasks, and successful completion releases quota immediately. Priority ties use numeric IDs, preventing lexicographic mistakes once IDs exceed nine. Return task records by value so clients cannot change status or extend deadlines.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).



## Practice

Use only in-memory state. Names and worker identifiers are strings; priorities are arbitrary integers. Integer timestamps, durations, and capacities exclude booleans. There is no execution, sleeping, wall clock, threading, disk, or network.

**Prototype:** implement `PriorityQueue()`. `add()` creates a task with the next integer identifier starting at 1. Duplicate names are valid. `pop()` removes the highest-priority task, breaking ties by smaller identifier, and returns `(id, name)` or `nullopt` when empty. Removed identifiers are never reused. Queues are independent.

**Final:** implement `TaskScheduler()`:

- `add_task()`: create a pending task with an increasing integer identifier starting at 1. Duplicate names and negative priorities are valid. Identifiers are never reused.
- `add_worker()`: require a positive integer capacity, otherwise raise `std::invalid_argument` first. Register a worker and return `true`; duplicates return `false` without changing their original capacity.
- `dispatch()`: require positive integer `lease`, otherwise raise `std::invalid_argument` before advancing time. After expiring old leases, return `nullopt` if the worker is unknown, full, or no task is pending. Otherwise choose highest priority then smallest identifier, assign it on `[ts, ts + lease)`, and return its snapshot. Each successful dispatch receives the next globally increasing integer lease token starting at 1; failures do not consume tokens.
- `complete()`: after expiry, return `true` only for a currently running task with exactly that token. Make it permanently done and clear assignment metadata. Wrong tokens, unknown tasks, completed tasks, and expired leases return `false` without a requested state change.
- `get_task()`: after expiry, return its snapshot or `nullopt` if unknown.
- `active()`: after expiry, return snapshots of that worker's running tasks ordered by numeric task identifier. An unknown worker returns `[]`.

Every task snapshot has exactly these keys: `id`, `name`, `priority`, `status`, `worker`, `expires_at`, `token`. Status is `pending`, `running`, or `done`. Assignment fields are `nullopt` for pending/done tasks. Every returned list and value record is a fresh snapshot.

Only the four methods taking `ts` advance time. Their valid calls, including calls returning `nullopt` or `false`, accept nonnegative nondecreasing timestamps; equal times are allowed. A negative or regressing timestamp raises `std::invalid_argument` before any state or time change. All valid timed calls first expire leases with `expires_at <= ts`; expired tasks become pending and receive a new token if reassigned. Rejected requests otherwise preserve state. Instances share no tasks, workers, tokens, or clocks.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp
struct Task {Int id;std::string name;Int priority;std::string status;Opt<std::string> worker;Opt<Int> expires_at,token;bool operator==(const Task&)const=default;};
class PriorityQueue { public:
 PriorityQueue();
 Int add(const std::string& name,Int priority);
 Opt<std::pair<Int,std::string>> pop();
};
class TaskScheduler { public:
 TaskScheduler();
 Int add_task(const std::string& name,Int priority);
 bool add_worker(const std::string& id,Int capacity);
 Opt<Task> dispatch(Int ts,const std::string& worker,Int lease);
 bool complete(Int ts,Int id,Int token);
 Opt<Task> get_task(Int ts,Int id);
 Vec<Task> active(Int ts,const std::string& worker);
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
