# Expense Sharing System in C++

Integer arithmetic avoids binary rounding but still needs a remainder policy. Divide cents by participant count, then distribute the remainder to the first sorted IDs. This allocates every cent once and makes caller ordering irrelevant.

```cpp
Int base=1000/3,remainder=1000%3; // 333 and 1
// Alphabetically first participant receives 334; the other two receive 333.
```

Maintain net balances whose sum is always zero. Credit the payer, debit participants, and validate settlement bounds before changing either side. Exact accepted retries must be recognized before checking today's balances; the original payment already changed them. Canonical expense identity sorts participants, while one shared registry distinguishes expense and settlement methods. Suggestions operate on copies and greedily pair alphabetic debtors/creditors; applying suggestions during a read would silently change accounting. This deterministic plan need not minimize transaction count.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).



## Practice

Arguments have the documented types. Money is integer cents; IDs and member names are case-sensitive strings. No floating-point conversion is required. Inputs must be copied where retained. Returned value records/lists must be fresh, and instances must be independent. There is no member deletion, expense editing, currency conversion, or external payment processing.

**Prototype:** implement `split_equal()`. Require `total >= 0` and a nonempty list of distinct, nonempty participant names; otherwise raise `std::invalid_argument`. Return shares in lexicographic member order. Give each participant `total / count`, and give the first `total % count` sorted members one extra cent. Zero shares are valid. Do not mutate the input list.

**Final:** implement `ExpenseSharing(members)`, where `members` is a nonempty list of distinct, nonempty names; invalid constructor input raises `std::invalid_argument`. Start every member at zero. The class manages one shared operation-ID namespace across expenses and settlements.

- `add_expense()`: require a nonempty operation ID, `total > 0`, a payer in the group, and a nonempty list of distinct group members. Invalid data raises `std::invalid_argument` unchanged. Split cents using the prototype's rule. Credit the payer with total, debit each participant with their share, and return `true` for a newly accepted expense. The payer may be absent from participants.
- `settle()`: require a nonempty ID, two distinct group members, and `amount > 0`; invalid structure raises `std::invalid_argument`. For a new ID, require `balance[debtor] <= -amount` and `balance[creditor] >= amount`, otherwise raise `std::invalid_argument` unchanged. Increase the debtor balance by amount and decrease the creditor balance by amount. Return `true` on acceptance.
- Both mutation methods recognize exact retries after structural validation and before applying any balance-dependent checks. A repeated accepted operation returns `false` without mutation. For expense identity, participant order is ignored; payer, total, and participant membership must match. For settlements, debtor, creditor, and amount must match. Reusing any accepted ID with different data or a different method raises `std::invalid_argument`. Failed requests do not consume IDs.
- `balances()`: return every member, including zero balances, in lexicographic key order. Positive means owed money; negative means owes money. The sum must always be zero.
- `suggest_settlements()`: use copies of balances. Sort debtors and creditors independently by name. Match the first remaining debtor to the first remaining creditor for the smaller remaining amount; advance each exhausted side and repeat. Return `(debtor, creditor, cents)` tuples in that generated order. Omit zero amounts. Reading suggestions never applies them. Return `[]` when all balances are zero; no minimum-transfer claim is required.

Every invalid request preserves balances and the operation registry.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp

inline std::map<std::string,Int> split_equal(Int total,Strings participants);
class ExpenseSharing { public:
 explicit ExpenseSharing(const Strings& members);
 bool add_expense(const std::string& id,const std::string& payer,Int total,Strings participants);
 bool settle(const std::string& id,const std::string& debtor,const std::string& creditor,Int amount);
 std::map<std::string,Int> balances() const;
 Vec<std::tuple<std::string,std::string,Int>> suggest_settlements() const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
