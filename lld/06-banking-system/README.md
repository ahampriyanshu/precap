# Banking System

## The problem

A banking system owns accounts, balances, and the rules that move money between accounts. An account identifier names one balance; it is not the balance itself. Model money as integer units, such as cents, so adding and comparing amounts does not introduce floating point rounding. Deposits introduce funds, whereas transfers must conserve the sum of all balances. No successful operation may leave an account negative.

The useful design question is where to enforce these rules. A caller should ask the bank to transfer money rather than retrieve two mutable accounts and edit them independently. Keeping that responsibility in one object makes the transfer's validation and state change reviewable together.

## Naive approach

Start with a dictionary from account identifiers to integer balances. For a transfer, subtract from the source, then look up the destination and add the amount. A separate dictionary can accumulate outgoing spending. Ranking accounts is a sort by descending spending followed by ascending identifier.

An exception after the debit leaves the dictionary changed:

```python
balances = {"a": 100}
try:
    balances["a"] -= 30
    balances["missing"] += 30
except KeyError:
    pass
print(balances)
assert sum(balances.values()) == 70
```

The missing destination destroyed conservation. Validating the complete transfer first is simpler than inventing compensating mutations for every failing line.

This representation is reasonable. The fragile part is changing state before checking the entire request. If the destination is missing, the debit has already happened. Refunding after every possible error adds more paths that can themselves be wrong. A self-transfer can also leave balances unchanged while incorrectly increasing spending.

## Where the naive approach breaks

Consider accounts `a=100` and `b=0`. A request `r1` transfers 30 from `a` to `b`, producing `(70, 30)`. The caller loses the response and retries `r1`. Executing it twice produces `(40, 60)`, even though the caller intended one transfer. Retrying after a communication failure is a separate concern from checking funds.

There is another ambiguity: a caller might reuse `r1` for a transfer of 40. Treating every repeated identifier as success would silently accept a different request. The system must remember both the successful request's arguments and its original result. Failed requests also need a policy: this exercise does not reserve their identifiers, so a request rejected for insufficient funds can succeed after a later deposit.

## A better design

Use one bank object with private balance, outgoing-total, and successful-request maps. Validate positive amounts, distinct existing accounts, available funds, and request-identifier conflicts before applying any balance or spending changes. A successful transfer updates both balances, the source's outgoing total, and the replay record as one sequential method operation. This is all-or-nothing behavior within the exercise's single caller; it is not a concurrency or crash-safety guarantee.

A retry record must bind identity to arguments and the original response:

```python
saved = {"r1": (("a", "b", 30), (70, 30))}
def replay(request_id, arguments):
    previous, result = saved[request_id]
    if arguments != previous:
        raise ValueError("request ID reused with different arguments")
    return result

print(replay("r1", ("a", "b", 30)))
assert replay("r1", ("a", "b", 30)) == (70, 30)
```

Replaying returns the saved result, regardless of later balances. This lookup is only the repeated-request branch; the first successful transfer must install its record together with the balance change. In-memory ordering provides no recovery after a process crash.

For `r1`, store the argument tuple and the result `(70, 30)`. A matching retry returns that original tuple even if subsequent deposits changed the live balances. A conflicting retry raises an error without modifying either the stored request or the accounts. Return fresh ranking lists so callers cannot insert fake spending entries into bank state.

Dictionary lookups are expected constant time. A transfer uses a fixed number of them; ranking all `A` accounts costs `O(A log A)` time and `O(A)` result workspace. Remembering `R` successful request identifiers takes `O(R)` memory. An unlimited replay cache grows indefinitely, so an actual service would need a documented retention policy and durable storage appropriate to its guarantees.

## Real-world usage

The same validation and replay ideas apply to wallet credits, inventory reservations, and payment request handlers. Integer amounts and request fingerprints make behavior precise, but a real financial service needs durable accounting records, access control, and coordination between concurrent writers. This small model teaches the boundary around a state transition; it does not implement a financial ledger or a distributed transaction protocol.

## Practice

Use only in-memory state. Identifiers are nonempty strings supplied by the caller. Amounts and limits are integers, excluding booleans. There are no timestamps, threads, persistence, or external services.

**Prototype:** implement `BalanceAccount()` with initial balance zero. `balance()` returns the integer balance. `deposit(amount)` requires `amount > 0`, adds it, and returns the new balance. `withdraw(amount)` requires `amount > 0`; return `False` without mutation if funds are insufficient, otherwise debit and return `True`. Invalid amounts raise `ValueError` without mutation.

**Final:** implement `Bank()`:

- `create_account(account_id) -> bool`: create a zero-balance account and zero outgoing total; return `False` on a duplicate without resetting it.
- `balance(account_id) -> int | None`: return the balance, or `None` for an unknown account.
- `deposit(account_id, amount) -> int | None`: reject nonpositive amounts with `ValueError` first; return `None` for an unknown account, otherwise return its new balance.
- `transfer(request_id, source, target, amount) -> tuple[int, int] | None`: reject a nonpositive amount with `ValueError` first. A previously successful request with exactly the same `(source, target, amount)` returns its original `(source_balance, target_balance)`. Reusing that identifier with different arguments raises `ValueError`. Otherwise return `None` without mutation for missing accounts, identical accounts, or insufficient funds. On success move the amount, add it only to the source's outgoing total, record the successful request, and return the two resulting balances. Failures do not consume request identifiers.
- `top_spenders(limit) -> list[tuple[str, int]]`: return at most `limit` accounts ordered by outgoing total descending, then identifier ascending. Include zero-spending accounts. Zero returns `[]`; negative limits raise `ValueError`. The list is a fresh snapshot.

All raised errors and rejected requests preserve state. Separate instances are independent. Run `python main.py --stage prototype`, then `python main.py --stage final` (the default). Edit `exercise.py`; leave `main.py` unchanged.
