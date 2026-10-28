# Expense Sharing System

## The problem

An expense sharing system records who paid and who should bear each cost. It must convert those facts into balances without creating or losing money through rounding or repeated requests. Positive balances mean a member should receive money; negative balances mean the member owes money. The sum of all balances must remain zero after every accepted expense and settlement.

Use integer cents throughout this exercise. An expense identifies its payer, amount, and participants. The payer belongs to the group but need not be one of the participants. An operation identifier distinguishes a retry of the same request from a genuinely new expense. A settlement records that one member paid another; it updates the accounting model without performing a bank transfer.

## Naive approach

Divide a floating-point amount by the participant count and store each person's share. Keep a dictionary of balances and update it whenever a request arrives. To display debts, scan negative and positive balances and pair people until the amounts appear settled. This outline is small, but it leaves important rules unstated: rounding, participant duplication, repeated calls, and how to validate a settlement.

Independent rounding can fail even when every individual share looks reasonable:

```python
from decimal import Decimal, ROUND_HALF_UP

total = Decimal("10.00")
share = (total / 3).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
allocated = share * 3
print(share, allocated)
assert allocated != total
```

Three shares of 3.33 allocate only 9.99. Decimal representation removes binary floating-point error, but it does not decide who receives the remaining cent.

Another approach stores pairwise debts to preserve who originally owed whom. It is unnecessary if the product only needs net balances, and it increases the number of values every change must keep consistent.

## Where the naive approach breaks

Independent rounding can allocate more or less than the original amount. Floating-point arithmetic adds representation errors to that policy problem. Listing a participant twice can also charge the same person twice unless duplicates have a defined meaning. This exercise rejects duplicate participants, so accidental repetition cannot silently affect allocation.

A client may retry after losing a response. Applying the same expense again doubles the balances. Conversely, treating every reused identifier as harmless hides conflicting requests. Settlement validation has a related ordering issue: an exact retry should be recognized before checking today's balances, since the original settlement has already changed them.

## A better design

Maintain a fixed member set, a balance map, and a registry of accepted operation IDs with canonical request data. Validate request structure first. If its ID already exists, compare the canonical data: identical retries return without mutation, while conflicting reuse raises an error. Only a new valid request changes balances and enters the registry.

Quotient and remainder preserve the integer total deterministically:

```python
participants = ["C", "A", "B"]
total = 1000
base, remainder = divmod(total, len(participants))
shares = {member: base + (index < remainder)
          for index, member in enumerate(sorted(participants))}
balances = {member: -share for member, share in shares.items()}
balances["C"] += total
print(shares, balances)
assert sum(shares.values()) == total
assert sum(balances.values()) == 0
```

A receives the extra cent regardless of caller order. This arithmetic assumes nonempty unique valid participants and a positive amount; operation deduplication and settlement validation must wrap it before any live balances change.

Allocate an equal split using quotient and remainder. Sort participant IDs; everyone receives `total // count` cents, and the first `total % count` IDs receive one additional cent. This assigns every cent exactly once and makes caller list order irrelevant. Credit the payer with the entire total, then debit each participant's allocated share.

Sorting P participants costs O(P log P), and applying shares costs O(P). Balance snapshots cost O(U) for U members. Deterministic settlement suggestions can sort debtors and creditors, then greedily match remaining amounts in O(U log U) time. The suggestions conserve balances and produce a valid plan, but do not promise the smallest possible number of transfers. The operation registry grows with accepted history; forgetting IDs would weaken the retry guarantee.

## Real-world usage

Integer accounting and idempotency are useful in shared purchase trackers, reimbursement tools, and payment request services. The zero-sum invariant detects many implementation errors. Net balances deliberately lose the original pairwise debt relationships, so a product needing disputes or expense-level reports would retain a separate ledger. This exercise has one currency, a fixed member list, sequential calls, and no external transfers. Currency conversion, refunds, durable records, and concurrent writes require additional policies and storage guarantees.

## Practice

Arguments have the documented types. Money is integer cents; IDs and member names are case-sensitive strings. No floating-point conversion is required. Inputs must be copied where retained. Returned dictionaries/lists must be fresh, and instances must be independent. There is no member deletion, expense editing, currency conversion, or external payment processing.

**Prototype:** implement `split_equal(total, participants) -> dict[str, int]`. Require `total >= 0` and a nonempty list of distinct, nonempty participant names; otherwise raise `ValueError`. Return shares in lexicographic member order. Give each participant `total // count`, and give the first `total % count` sorted members one extra cent. Zero shares are valid. Do not mutate the input list.

**Final:** implement `ExpenseSharing(members)`, where `members` is a nonempty list of distinct, nonempty names; invalid constructor input raises `ValueError`. Start every member at zero. The class manages one shared operation-ID namespace across expenses and settlements.

- `add_expense(operation_id, payer, total, participants) -> bool`: require a nonempty operation ID, `total > 0`, a payer in the group, and a nonempty list of distinct group members. Invalid data raises `ValueError` unchanged. Split cents using the prototype's rule. Credit the payer with total, debit each participant with their share, and return `True` for a newly accepted expense. The payer may be absent from participants.
- `settle(operation_id, debtor, creditor, amount) -> bool`: require a nonempty ID, two distinct group members, and `amount > 0`; invalid structure raises `ValueError`. For a new ID, require `balance[debtor] <= -amount` and `balance[creditor] >= amount`, otherwise raise `ValueError` unchanged. Increase the debtor balance by amount and decrease the creditor balance by amount. Return `True` on acceptance.
- Both mutation methods recognize exact retries after structural validation and before applying any balance-dependent checks. A repeated accepted operation returns `False` without mutation. For expense identity, participant order is ignored; payer, total, and participant membership must match. For settlements, debtor, creditor, and amount must match. Reusing any accepted ID with different data or a different method raises `ValueError`. Failed requests do not consume IDs.
- `balances() -> dict[str, int]`: return every member, including zero balances, in lexicographic key order. Positive means owed money; negative means owes money. The sum must always be zero.
- `suggest_settlements() -> list[tuple[str, str, int]]`: use copies of balances. Sort debtors and creditors independently by name. Match the first remaining debtor to the first remaining creditor for the smaller remaining amount; advance each exhausted side and repeat. Return `(debtor, creditor, cents)` tuples in that generated order. Omit zero amounts. Reading suggestions never applies them. Return `[]` when all balances are zero; no minimum-transfer claim is required.

Every invalid request preserves balances and the operation registry. Run `python main.py --stage prototype`, then `python main.py --stage final` (the default). Edit only `exercise.py`.
