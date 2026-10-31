# Library Management System in C++

Title identity and copy identity are different keys. Multiple copies share a title; a loan reserves one particular copy and records its owner. Check a member's existing active title before checking free copies, so exhaustion does not mask a duplicate-loan error.

```cpp
std::map<std::string,Loan> active_by_copy;
// A return checks active_by_copy[id].member_id before erasing the row.
```

Sorting copy identifiers creates deterministic allocation. Returning a wrong owner's copy must not free it, while returning an unknown copy is a harmless false result. Catalog records remain immutable and loan state is separate, allowing availability to be derived consistently. Value snapshots prevent a caller rewriting loan ownership. Sequential service methods form the atomic boundary; there are no due dates or wall-clock decisions to complicate the model.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).



## Practice

**Prototype:** implement `available_copies(copies, title)`. Input `copies` is a list of `(copy_id, title, available)` tuples with unique copy identifiers and boolean availability. Assume valid inputs. Return a fresh lexicographically sorted list of available identifiers whose title equals the supplied case-sensitive title. Do not modify input; an unknown title returns `[]`.

**Final:** implement `Library(copies)`, where `copies` is a list of `(copy_id, title)` pairs. Copy identifiers must be unique nonempty strings; titles and member identifiers are nonempty strings. Invalid constructor or method identifiers raise `std::invalid_argument` before mutation. Empty catalog is valid. Title strings are the title identity for this exercise; matching is exact and case-sensitive.

`borrow(member_id, title)` returns the smallest available copy identifier, or `nullopt` if the title is unknown or all its copies are loaned. If that member already holds this title, raise `std::invalid_argument` without changing any loan. `return_copy(copy_id, member_id)` returns `true` after releasing the member's loan; return `false` for an unknown or unloaned copy. If a different member holds it, raise `std::invalid_argument` without changing state. `available(title)` returns a fresh sorted list of free copy identifiers. `loans()` returns a fresh list of fresh value records with keys `copy_id`, `title`, and `member_id`, sorted by copy identifier. Copy constructor input and keep instances independent. Do not add due dates or catalog editing.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp
struct Loan {std::string copy_id,title,member_id;bool operator==(const Loan&)const=default;};
inline Strings available_copies(const Vec<std::tuple<std::string,std::string,bool>>& copies,const std::string& title);
class Library { public:
 explicit Library(const Vec<std::pair<std::string,std::string>>& copies);
 Opt<std::string> borrow(const std::string& member,const std::string& title);
 bool return_copy(const std::string& id,const std::string& member);
 Strings available(const std::string& title) const;
 Vec<Loan> loans() const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
