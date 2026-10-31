# Message Broker in C++

Retained messages and group progress are separate state. A group starts at the oldest retained message even when it subscribes late. A poll returning an already in-flight delivery repeats the same attempt; only a retry after rejection increments it.

```cpp
struct Progress {std::size_t offset=0;Int attempt=0;bool inflight=false;};
// ack is valid only while inflight, not between nack and redelivery.
```

Keep lifetime message-ID uniqueness independent of consumption and group offsets. Advancing one group must not consume another group's message. At the attempt limit, append one group-specific dead letter and advance that group's offset exactly once. Returning copies prevents a consumer changing retained payloads or delivery counters. No automatic timeout exists: retry transitions happen only through nack and a subsequent poll. These state transitions are deterministic without networking, threads, or sleeping.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).



## Practice

Inputs have the documented types. Message IDs, group IDs, and payloads are strings; empty strings are allowed. Payloads are immutable strings. All snapshots and returned lists must be fresh. Instances are independent. There is no clock, capacity limit, deletion, replay, or automatic delivery timeout.

**Prototype:** implement `MessageQueue()` with `publish()` and `consume()`. Publish returns `true` once per ID across the queue's lifetime, including IDs already consumed; a duplicate returns `false` without replacing content. Consume destructively returns the oldest the fields declared in the value record below or `nullopt` when empty.

**Final:** implement `MessageBroker(max_attempts=2)`:

- `max_attempts` is an integer; values below 1 raise `std::invalid_argument`. It counts deliveries, including the initial delivery.
- `publish()` appends to a retained FIFO log. IDs remain unique for the broker's lifetime. Duplicate IDs return `false` and preserve the original payload.
- `subscribe()` creates a group starting at the earliest retained message, including messages published before subscription. Return `false` if already subscribed; preserve existing progress.
- `poll()`: unknown or caught-up groups return `nullopt`. Otherwise return exactly the fields declared in the value record below. The first delivery at a position has attempt 1. An already in-flight delivery is returned again without incrementing its attempt. After a retryable rejection, poll redelivers the same message with the next attempt before any later message.
- `ack()`: return `true` only for that group's current in-flight ID, clear it, and advance to the next log position. Unknown groups, wrong IDs, duplicate acknowledgments, and acknowledgments between rejection and redelivery return `false` without changing state.
- `nack()`: only a matching in-flight delivery is valid. Invalid calls return `nullopt` unchanged. A valid call clears in-flight state. If its attempt is below the limit, return `"retry"` without advancing. At the limit, append the fields declared in the value record below to that group's dead letters, advance, reset attempts for the next message, and return `"dead-letter"`.
- `dead_letters()`: return detached entries in failure order, or `[]` for an unknown group. Reading does not drain the list.

A rejected publish or invalid acknowledgment must not affect any group.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp
struct Message {std::string id,payload;bool operator==(const Message&)const=default;};
struct Delivery {std::string id,payload;Int attempt;bool operator==(const Delivery&)const=default;};
struct DeadLetter {std::string id,payload;Int attempts;bool operator==(const DeadLetter&)const=default;};
class MessageQueue { public:
 MessageQueue();
 bool publish(const std::string& id,const std::string& payload);
 Opt<Message> consume();
};
class MessageBroker { public:
 explicit MessageBroker(Int max_attempts=2);
 bool publish(const std::string& id,const std::string& payload);
 bool subscribe(const std::string& group);
 Opt<Delivery> poll(const std::string& group);
 bool ack(const std::string& group,const std::string& id);
 Opt<std::string> nack(const std::string& group,const std::string& id);
 Vec<DeadLetter> dead_letters(const std::string& group) const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
