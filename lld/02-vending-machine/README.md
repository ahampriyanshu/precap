# Vending Machine

## The problem

A vending machine combines inventory with a customer's credit. Inserting money changes credit. A successful selection reduces stock, charges the price, returns change, and ends that credit session. A failed selection must preserve both the customer's money and the stock. Money uses integer units so equality and change calculations are exact.

This is a small transactional design. The public interface should make a complete purchase one operation, even though several fields change internally. Callers should not need to coordinate a stock decrement with a separate charge.

## Naive approach

A prototype can calculate `paid - price` and reject insufficient payment. This captures one useful rule, but a complete machine needs shared state. A quick extension might expose product dictionaries and a writable balance, then let a user interface subtract a price and reduce quantity.

The dangerous ordering is visible even without a user interface:

```python
state = {"credit": 150, "stock": 0}
price = 100
state["credit"] -= price
if state["stock"] == 0:
    outcome = "unavailable"
print(outcome, state["credit"])
assert state["credit"] == 50  # A failed sale charged the customer.
```

Checking stock after charging creates a partial purchase. An exception or failure return cannot automatically restore the earlier balance.

That makes the interface responsible for business rules. Every new interface must repeat the same checks in the same order. It also permits impossible states, such as negative stock or credit removed for a product that was never available.

## Where the naive approach breaks

Suppose a customer inserts 150 units and selects an item priced at 100. If the code charges first and then discovers zero stock, the customer loses credit. If a failed purchase clears the balance, even a harmless typo in a selection becomes expensive. Repeated refund calls can return the same money twice unless refund also changes state.

Returning the machine's internal inventory dictionary creates another path around its rules. Changing a nested stock field from outside the machine must not change what a later purchase sees. Invalid inventory at construction should be rejected before a usable machine exists.

## A better design

Let `VendingMachine` own catalog stock and credit. Its operations are insert, select, and refund. Product entries describe a price and a remaining quantity; they do not independently own the customer's money. For this exercise, one machine object represents one serialized customer session, so there is no hidden global balance.

Make the prospective transition explicit before committing it. Here is only its validation-and-planning boundary:

```python
def purchase_plan(credit, stock, price):
    if stock <= 0 or credit < price:
        return None
    return {"stock": stock - 1, "credit": 0, "change": credit - price}

assert purchase_plan(150, 0, 100) is None
plan = purchase_plan(150, 2, 100)
print(plan)
```

A failed plan carries no mutation; a successful plan describes one coherent result. Catalog lookup, input validation, and applying the plan remain the owning machine’s responsibilities. Calls are serialized, so planning does not reserve stock against another thread.

Selection first looks up the code, then checks stock and sufficient credit. Only after all checks succeed does it commit the stock reduction and clear credit. It returns a receipt containing the code and change. Refund captures the current credit, clears it, and returns the captured amount. The invariants are nonnegative stock, nonnegative credit, and exactly one disposition of inserted money: retained credit, a purchase charge, or a returned amount.

Dictionary lookups make selection expected O(1). An inventory snapshot costs O(p) for p products and must copy nested entries. Explicit validation adds code, but it concentrates the rules in one place and makes failure behavior testable. A separate state-machine class is unnecessary until the machine has more states than this interface can express clearly.

## Real-world usage

Similar designs appear in prepaid credit, ticket kiosks, and inventory reservations. A physical dispenser can fail after payment authorization, so production systems need an explicit dispensing result and compensation or reconciliation. Returning an integer change amount also assumes unlimited change availability. This exercise models an in-memory sale; coin denominations, hardware failure, durable transactions, multiple customers, and payment providers require additional boundaries.

## Practice

**Prototype:** implement `change_due(price, paid)`. Both arguments must be nonnegative integers, excluding booleans. Return `paid - price` when payment is sufficient; otherwise raise `ValueError`. Invalid values also raise `ValueError`.

**Final:** implement `VendingMachine(products)`, where `products` is a list of `(code, price, stock)` tuples. Codes must be unique nonempty strings, price a positive integer, and stock a nonnegative integer; booleans are invalid numeric inputs. Empty inventory is valid. Copy the supplied inventory. Invalid inventory raises `ValueError`.

`insert(amount)` accepts a positive integer, adds it to credit, and returns the new credit. `balance()` returns current credit. `select(code)` returns `{"code": code, "change": credit_before - price}` on success, decreases that item's stock by one, and sets credit to zero. Unknown codes raise `KeyError`. A known item with zero stock or insufficient credit raises `ValueError`. Failures leave all state unchanged. `refund()` returns current credit and resets it to zero; repeated refunds return zero. `inventory()` returns a fresh dictionary mapping each code to a fresh `{"price": price, "stock": stock}` dictionary. There is no restock operation, and instances must be independent.

Run `python main.py --stage prototype`, then `python main.py --stage final`. Default stage is `final`. Edit `exercise.py`; leave `main.py` unchanged.
