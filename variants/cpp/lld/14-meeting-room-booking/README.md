# Meeting Room Booking System in C++

Two half-open intervals overlap exactly when each starts before the other ends. Strict inequalities permit one meeting to begin exactly as another ends. Invalid empty or reversed intervals must be rejected before checking overlap.

```cpp
bool overlap = a_start < b_end && b_start < a_end;
// [10,20) and [20,30) do not overlap.
```

Multi-room requests require a plan before commitment. Reserving the first eligible room and then discovering no second room leaves a leaked reservation. Gather all candidates, sort by capacity and ID, and commit only if enough exist. Successful IDs remain reserved after cancellation; failed requests retain the ability to retry. Keep lifetime ID history separate from active bookings. Return the original selection order from allocation, while schedule uses time order. Copying room configuration prevents later caller mutations changing availability rules.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).



## Practice

Inputs have the documented types. Times, capacities, seat requests, and counts are integers. Room and booking IDs are case-sensitive strings. Each returned list/value record must be a detached snapshot, and instances must be independent. Time is an abstract coordinate; no clock, time zones, recurrence, or elapsed-time cleanup is used.

**Prototype:** implement `RoomCalendar()`:

- `reserve()`: `start >= 0` and `end > start` are required, otherwise raise `std::invalid_argument` unchanged. Intervals are half-open. Return `false` on any overlap, otherwise append the interval and return `true`.
- `slots()`: return all accepted intervals sorted by start then end, as a fresh list. Repeating the same reservation overlaps and returns `false`.

**Final:** implement `MeetingRoomBooking(rooms)`, where `rooms` is a value record the fields declared in the value record below. Copy the value record. Empty catalogs are allowed; an empty room ID or capacity below 1 raises `std::invalid_argument`.

- `book()`: require nonempty booking ID, `start >= 0`, `end > start`, `seats >= 1`, and `room_count >= 1`; otherwise raise `std::invalid_argument` before any other check. Each selected room must independently hold at least `seats` people. Choose exactly `room_count` available rooms by `(capacity, room_id)` ascending. Return their IDs in that order and commit them together. If too few rooms qualify, return `nullopt` without reserving anything or consuming the ID.
- A successfully used booking ID remains reserved for the instance's lifetime, including after cancellation. Repeating `book` with that ID returns `nullopt`, even if arguments match; validation still happens first. A failed request's ID may be retried.
- `cancel()`: cancel all assignments for one active booking and return `true`. Missing or already cancelled bookings return `false` without changing other bookings.
- `allocation()`: return a fresh list of room IDs in the original selection order for an active booking. Missing or cancelled bookings return `nullopt`.
- `schedule()`: unknown room raises `std::invalid_argument`. Return active reservations for that room sorted by `(start, end, id)` ascending. Each entry has exactly the fields declared in the value record below. A multi-room booking appears once in each assigned room's schedule.

Invalid and unsuccessful requests preserve all schedules and existing allocations.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp
struct Reservation {std::string id;Int start,end,seats;bool operator==(const Reservation&)const=default;};
class RoomCalendar { public:
 RoomCalendar();
 bool reserve(Int start,Int end);
 Vec<Pair> slots() const;
};
class MeetingRoomBooking { public:
 explicit MeetingRoomBooking(std::map<std::string,Int> rooms);
 Opt<Strings> book(const std::string& id,Int start,Int end,Int seats,Int room_count=1);
 bool cancel(const std::string& id);
 Opt<Strings> allocation(const std::string& id) const;
 Vec<Reservation> schedule(const std::string& room) const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
