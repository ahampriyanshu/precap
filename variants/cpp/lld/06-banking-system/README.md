# Banking System in C++

An idempotency record contains both request identity and the original response. Replaying by recomputing current balances is wrong: later deposits or transfers may have changed them. Store a successful request's exact response and reject conflicting reuse of its identifier.

```cpp
using Identity=std::tuple<std::string,std::string,Int>; // source,target,amount
// Validate amount and identifiers before consulting the replay registry.
```

A failed transfer consumes neither money nor its request ID, allowing a later retry after funding. Debit, credit, outgoing ranking, and replay storage are one logical transition. Validate all preconditions before mutating balances. Summing balances before and after a transfer exposes accidental money creation, while checking outgoing totals catches mistakenly ranking deposits as spending. The exercise assumes serialized calls and bounded arithmetic; a durable bank would need a transaction spanning all affected rows.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).



## Practice

Use only in-memory state. Identifiers are nonempty strings supplied by the caller. Amounts and limits are integers within the declared C++ numeric type. There are no timestamps, threads, persistence, or external services.

**Prototype:** implement `BalanceAccount()` with initial balance zero. `balance()` returns the integer balance. `deposit(amount)` requires `amount > 0`, adds it, and returns the new balance. `withdraw(amount)` requires `amount > 0`; return `false` without mutation if funds are insufficient, otherwise debit and return `true`. Invalid amounts raise `std::invalid_argument` without mutation.

**Final:** implement `Bank()`:

- `create_account()`: create a zero-balance account and zero outgoing total; return `false` on a duplicate without resetting it.
- `balance()`: return the balance, or `nullopt` for an unknown account.
- `deposit()`: reject nonpositive amounts with `std::invalid_argument` first; return `nullopt` for an unknown account, otherwise return its new balance.
- `transfer()`: reject a nonpositive amount with `std::invalid_argument` first. A previously successful request with exactly the same `(source, target, amount)` returns its original `(source_balance, target_balance)`. Reusing that identifier with different arguments raises `std::invalid_argument`. Otherwise return `nullopt` without mutation for missing accounts, identical accounts, or insufficient funds. On success move the amount, add it only to the source's outgoing total, record the successful request, and return the two resulting balances. Failures do not consume request identifiers.
- `top_spenders()`: return at most `limit` accounts ordered by outgoing total descending, then identifier ascending. Include zero-spending accounts. Zero returns `[]`; negative limits raise `std::invalid_argument`. The list is a fresh snapshot.

All raised errors and rejected requests preserve state. Separate instances are independent.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp

class BalanceAccount { public:
 BalanceAccount();
 Int balance() const;
 Int deposit(Int amount);
 bool withdraw(Int amount);
};
class Bank { public:
 Bank();
 bool create_account(const std::string& id);
 Opt<Int> balance(const std::string& id) const;
 Opt<Int> deposit(const std::string& id,Int amount);
 Opt<Pair> transfer(const std::string& request,const std::string& source,const std::string& target,Int amount);
 Vec<std::pair<std::string,Int>> top_spenders(Int limit) const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
