# 12. Rollback a reservation if dispatch fails

**Track:** Harborline Python · **Focus:** context managers, generators and exception propagation

## The next incident

Retries are explicit. A shipment must now reserve local stock while a dispatch block runs. If that block raises, its reservation must be released; if it succeeds, the reservation stays committed.

**Connection:** Continue after Retry a transient outage without hiding a bad request.

## First make the small version

Implement `prototype`: return the remaining stock after a known-successful reservation.

## Why the script has to change

Duplicated try/except cleanup forgets less common exits. Catching and swallowing the exception makes the caller believe dispatch succeeded. Nested reservations require restoring only the quantity reserved by the failing block, not replacing the entire stock snapshot.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/library/contextlib.html#contextlib.contextmanager).

## Your production task

Implement reservation(stock,sku,quantity) as a context manager over a mutable stock dict. Validate a positive exact-int quantity and sufficient stock; raise ValueError before entering the body if invalid. Subtract before yield, yield the same stock object, keep subtraction on normal exit, and add back exactly quantity on any BaseException while re-raising it. The body must not directly edit that sku except through nested reservation contexts. This is single-threaded.

Here rollback on BaseException is intentional cleanup, followed by re-raising; it is not a license to treat cancellation or KeyboardInterrupt as ordinary successful outcomes.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** The same shipment appears twice in a set.
