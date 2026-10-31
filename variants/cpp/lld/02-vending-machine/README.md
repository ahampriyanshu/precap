# Vending Machine in C++

A sale moves money and stock together. Validate product existence, stock, and affordability before decrementing anything. This preserves the customer's credit when a selection fails.

```cpp
struct Sale {std::string code;Int change;};
// Construct the result before resetting session credit to zero.
```

Returning a catalog map by value copies nested Product records too. Returning a reference would let clients change price or replenish stock without a supported operation. Distinguish unknown products (`out_of_range`) from valid products that cannot currently be sold (`invalid_argument`). Integer units keep change exact. The core conservation check is inserted money equals sale price plus change plus remaining credit/refunds; decrementing credit before validation would violate it.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).



## Practice

**Prototype:** implement `change_due(price, paid)`. Both arguments must be nonnegative integers within the declared C++ numeric type. Return `paid - price` when payment is sufficient; otherwise raise `std::invalid_argument`. Invalid values also raise `std::invalid_argument`.

**Final:** implement `VendingMachine(products)`, where `products` is a list of `(code, price, stock)` tuples. Codes must be unique nonempty strings, price a positive integer, and stock a nonnegative integer; numeric inputs use Int. Empty inventory is valid. Copy the supplied inventory. Invalid inventory raises `std::invalid_argument`.

`insert(amount)` accepts a positive integer, adds it to credit, and returns the new credit. `balance()` returns current credit. `select(code)` returns the fields declared in the value record below on success, decreases that item's stock by one, and sets credit to zero. Unknown codes raise `std::out_of_range`. A known item with zero stock or insufficient credit raises `std::invalid_argument`. Failures leave all state unchanged. `refund()` returns current credit and resets it to zero; repeated refunds return zero. `inventory()` returns a fresh value record mapping each code to a fresh the fields declared in the value record below value record. There is no restock operation, and instances must be independent.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp
struct Product {Int price,stock;bool operator==(const Product&)const=default;};
struct Sale {std::string code;Int change;bool operator==(const Sale&)const=default;};
inline Int change_due(Int price,Int paid);
class VendingMachine { public:
 explicit VendingMachine(const Vec<std::tuple<std::string,Int,Int>>& products);
 Int insert(Int amount);
 Int balance() const;
 Sale select(const std::string& code);
 Int refund();
 std::map<std::string,Product> inventory() const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
