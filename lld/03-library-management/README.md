# Library Management System

## The problem

A library lends physical copies of titles to members. Several copies can have the same title, but each copy has its own identifier and can have at most one active borrower. A useful design must distinguish a title, which a reader requests, from the particular copy that leaves the shelf.

The system also needs a clear lending policy. In this lesson, a member may hold one copy of a given title at a time. Different members may borrow different copies of that title. Returning a copy requires the identity of the member who currently holds it.

## Naive approach

A first catalog might map a title to an available count. Borrowing subtracts one, and returning adds one. This is enough to answer whether a title has spare copies. A pure function that filters available copy records is a useful next prototype because it introduces physical identity without yet managing loans.

A count accepts returns without proving that any physical copy was on loan:

```python
available = {"Python": 1}
available["Python"] -= 1  # Borrow one physical copy.
available["Python"] += 1  # Return it.
available["Python"] += 1  # Repeat the same return.
print(available["Python"])
assert available["Python"] == 2
```

The catalog has invented a copy. A loan identity, rather than arithmetic on availability alone, is needed to recognize the completed return.

Counts alone cannot answer which copy a member borrowed. They also cannot distinguish a legitimate return from a duplicate return. If callers are allowed to update counts and member records separately, failures can leave the catalog and the loan list disagreeing.

## Where the naive approach breaks

Imagine two copies of the same title. One member borrows both because the system only checks total availability, violating the intended lending policy. Another member returns a copy they never borrowed, increasing availability above the number of physical copies. Repeating a return makes the error worse.

Using a title as a unique copy identifier causes a different failure: the second copy overwrites the first. Exposing mutable loan dictionaries lets callers silently transfer a loan to another member. These problems all follow from unclear identity and unclear ownership of state changes.

## A better design

Make `Library` the coordinator for catalog and active loans. The catalog maps copy identifiers to titles. The loan records map copy identifiers to members. Borrowing first checks whether the member already holds the title, then chooses the lexicographically smallest free copy identifier. A title with no free copies produces an ordinary unavailable result.

Derive availability from copy identity and active loans:

```python
catalog = {"B1": "Python", "B2": "Python"}
loans = {"B1": "M1"}
free = sorted(copy_id for copy_id, title in catalog.items()
              if title == "Python" and copy_id not in loans)
print(free)
assert free == ["B2"]
assert set(loans) <= set(catalog)
```

No second availability counter can drift from these records. This query does not authorize a borrow: the coordinator must still enforce the member/title rule before recording the chosen copy.

Returning an unknown or unloaned copy is a safe no-op. Returning a copy held by a different member is an error and preserves the loan. This distinction allows a repeated completed return while still catching an attempt to release someone else's active loan. Validation happens before any mutation.

The invariants are one active borrower per copy and no duplicate active title per member. Deriving availability from the catalog and loans avoids maintaining a separate count that can drift. A simple scan is O(c) for c copies; title and member indexes can speed queries but require synchronized updates. Return lookup is expected O(1) with a dictionary. Keep the simpler version until measured needs justify extra indexes.

## Real-world usage

The copy-versus-title distinction also appears in equipment rental: a product model is different from a serial-numbered unit. Larger libraries need bibliographic identifiers because equal title strings do not reliably identify editions. Holds, due dates, fines, renewals, lost copies, persistence, and concurrent circulation desks introduce additional policies. This exercise deliberately owns a fixed in-memory catalog and active loan lifecycle, with serialized calls.

## Practice

**Prototype:** implement `available_copies(copies, title)`. Input `copies` is a list of `(copy_id, title, available)` tuples with unique copy identifiers and boolean availability. Assume valid inputs. Return a fresh lexicographically sorted list of available identifiers whose title equals the supplied case-sensitive title. Do not modify input; an unknown title returns `[]`.

**Final:** implement `Library(copies)`, where `copies` is a list of `(copy_id, title)` pairs. Copy identifiers must be unique nonempty strings; titles and member identifiers are nonempty strings. Invalid constructor or method identifiers raise `ValueError` before mutation. Empty catalog is valid. Title strings are the title identity for this exercise; matching is exact and case-sensitive.

`borrow(member_id, title)` returns the smallest available copy identifier, or `None` if the title is unknown or all its copies are loaned. If that member already holds this title, raise `ValueError` without changing any loan. `return_copy(copy_id, member_id)` returns `True` after releasing the member's loan; return `False` for an unknown or unloaned copy. If a different member holds it, raise `ValueError` without changing state. `available(title)` returns a fresh sorted list of free copy identifiers. `loans()` returns a fresh list of fresh dictionaries with keys `copy_id`, `title`, and `member_id`, sorted by copy identifier. Copy constructor input and keep instances independent. Do not add due dates or catalog editing.

Run `python main.py --stage prototype`, then `python main.py --stage final`. The default stage is `final`. Edit `exercise.py`; leave `main.py` unchanged.
