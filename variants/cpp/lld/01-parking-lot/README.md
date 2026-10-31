# Parking Lot in C++

Separate immutable inventory from active allocation. A vehicle's eligibility compares size ranks; selection compares `(rank, identifier)`, not input order. Ticket IDs identify allocation lifecycles and advance only after a successful commitment.

```cpp
struct Candidate {int rank;std::string id;};
// Validate every inventory row before selecting any candidate.
```

Validate before checking capacity so malformed records do not hide behind a full lot. Prepare the selected spot before recording the active ticket. Removing a ticket releases exactly its recorded spot, rather than recomputing allocation. Return ticket records by value to prevent callers changing internal vehicle identity. Sequential atomicity here means failure leaves state unchanged; concurrent check-and-commit would additionally need one lock spanning both steps.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).



## Practice

All spot and vehicle identifiers are nonempty strings. Kinds are exactly `motorcycle`, `car`, and `van`, ranked in that order. Invalid identifiers or kinds raise `std::invalid_argument` before mutation.

**Prototype:** implement `choose_spot(spots, vehicle_kind)`. `spots` is a list of `(spot_id, kind)` pairs with unique identifiers; every listed spot is free. Return the selected spot identifier or `nullopt`. Use smallest compatible kind, then lexicographic identifier. Do not change the input. Validate every spot, including spots that cannot be selected; duplicate spot identifiers raise `std::invalid_argument`.

**Final:** implement `ParkingLot(spots)` with the same inventory validation; an empty inventory is valid. `park(vehicle_id, kind)` returns a fresh ticket value record with keys `ticket_id`, `vehicle_id`, `vehicle_kind`, and `spot_id`, or `nullopt` if no compatible spot is free. Ticket numbers start at 1 and advance only on success. A vehicle with an active ticket raises `std::invalid_argument`; after release it may park again. `release(ticket_id)` accepts an integer identifier and returns the released ticket as a fresh value record, or `nullopt` for an unknown or already released identifier. `active_tickets()` returns fresh value records in a fresh list ordered by ticket number. `available_spots()` returns a fresh list of `(spot_id, kind)` tuples ordered by kind rank, then identifier. Separate lots own separate state. Invalid requests and capacity failures leave state and the next ticket number unchanged.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp
struct Ticket {Int ticket_id;std::string vehicle_id,vehicle_kind,spot_id;bool operator==(const Ticket&)const=default;};
inline Opt<std::string> choose_spot(const Vec<std::pair<std::string,std::string>>& spots,const std::string& kind);
class ParkingLot { public:
 explicit ParkingLot(Vec<std::pair<std::string,std::string>> spots);
 Opt<Ticket> park(const std::string& id,const std::string& kind);
 Opt<Ticket> release(Int id);
 Vec<Ticket> active_tickets() const;
 Vec<std::pair<std::string,std::string>> available_spots() const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
