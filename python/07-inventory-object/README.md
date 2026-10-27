# 07. Make invalid inventory states unreachable

**Track:** Harborline Python · **Focus:** classes, encapsulation and instance ownership

## The next incident

Shipment records are explicit. Several functions still change a stock dictionary directly, so each must remember the same nonnegative-stock rule. Ishan moves the invariant into one object.

**Connection:** Continue after A dictionary typo reaches the loading bay.

## First make the small version

Implement `prototype`: subtract a reservation from a scalar stock value, assuming it fits.

## Why the script has to change

A shared class-level stock dictionary leaks inventory across depots. A method that subtracts before checking can leave negative stock even when it raises. Encapsulation is useful only if it controls every state transition.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/tutorial/classes.html).

## Your production task

Implement Inventory(stock), available(sku), reserve(sku,quantity) and snapshot(). Copy initial stock; require nonnegative exact ints. reserve requires a positive exact int; return False without mutation when insufficient, otherwise subtract and return True. Missing SKU is zero. snapshot returns a detached dictionary. Invalid quantities raise ValueError.

Keep state per instance and validate before changing it. A private-looking name is a convention, not a security boundary; the API and its tests establish the invariant.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** Add drones without rewriting the dispatcher.
