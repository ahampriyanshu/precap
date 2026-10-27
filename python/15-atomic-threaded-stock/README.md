# 15. Two dispatchers reserve the last crate

**Track:** Harborline Python · **Focus:** threads, locks and atomic invariants

## The next incident

The single-threaded inventory works. Two dispatch desks now run in threads and can both observe the last crate before either subtracts it. Object encapsulation did not make the check-and-update atomic.

**Connection:** Continue after Reuse field validation without sharing field values.

## First make the small version

Implement `prototype`: process a sequential list of positive reservation quantities, returning (success_flags,remaining).

## Why the script has to change

Protecting only the subtraction still leaves the availability check stale. The GIL is not a transaction around a multi-step business invariant, and free-threaded CPython builds make relying on it even less defensible. Threads are useful for shared I/O-oriented work; this lesson does not promise CPU speedup.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/library/threading.html).

## Your production task

Implement AtomicStock(quantity) with reserve(amount)->bool and remaining()->int. Require nonnegative exact-int initial stock and positive exact-int reservations. Every check/update and remaining read must use the instance’s _lock context manager. Keep integer state in _quantity. Expose these two names as test seams. Failed/invalid reservations do not change stock. No global lock or class-level quantity.

The synchronized probe makes the lock boundary testable without hoping an uncontrolled race happens. Locking only successful updates is insufficient: the decision is part of the critical section.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** The input desk must not outrun the workers.
