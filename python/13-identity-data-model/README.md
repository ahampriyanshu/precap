# 13. The same shipment appears twice in a set

**Track:** Harborline Python · **Focus:** dunder methods, immutability, equality, hashing and ordering

## The next incident

Reservation rollback works. Deduplication still fails because two normalized representations of the same shipment become different dictionary keys. Identity must mean the same thing across equality, hashing and ordering.

**Connection:** Continue after Rollback a reservation if dispatch fails.

## First make the small version

Implement `prototype`: normalize a textual shipment ID with strip().casefold().

## Why the script has to change

Implementing __eq__ without a compatible __hash__ breaks key use. Mutating a hashed key after insertion can make an entry unreachable. Returning False for every foreign comparison also blocks Python’s reflected comparison protocol.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/reference/datamodel.html#object.__hash__).

## Your production task

Complete immutable ShipmentKey(depot,shipment). Strip and casefold both fields and reject empties with ValueError. Equality/hash use the normalized pair; ordering is lexicographic on that pair. Expose read-only depot and shipment properties. __eq__ and __lt__ return NotImplemented for unrelated types. Use functools.total_ordering for the other comparisons. Field assignment after construction raises AttributeError.

Hashability is a behavioral promise about lifetime, not simply the presence of a __hash__ method. This lesson also makes Python’s NotImplemented comparison protocol observable.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** Reuse field validation without sharing field values.
