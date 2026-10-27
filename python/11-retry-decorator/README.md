# 11. Retry a transient outage without hiding a bad request

**Track:** Harborline Python · **Focus:** closures, decorators and exception selection

## The next incident

Streaming avoids loading every record at once. The external carrier occasionally fails transiently, and retry loops are being copied into every caller. Ishan wants one reusable policy with explicit limits.

**Connection:** Continue after A million records must not become a million objects.

## First make the small version

Implement `prototype`: return the first value in a list of attempt outcomes that is not None, or None if all failed.

## Why the script has to change

Catching Exception and retrying everything wastes time on invalid requests and can duplicate side effects. A shared retry counter in the closure also leaks exhausted state between calls. Decoration must not execute the wrapped operation.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/library/functools.html#functools.wraps).

## Your production task

Implement retry(*,attempts,exceptions) returning a synchronous decorator. attempts is a positive exact int; exceptions is a tuple of Exception subclasses. Retry only those exceptions, at most attempts total calls; on exhaustion re-raise the last exception. Keep attempts local to each invocation, preserve metadata with functools.wraps, and forward args/kwargs. Do not sleep. This lesson assumes the caller chooses an idempotent operation.

A decorator changes how a callable is invoked; it is not a transaction. The selected exception family is part of the caller’s correctness argument.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** Rollback a reservation if dispatch fails.
