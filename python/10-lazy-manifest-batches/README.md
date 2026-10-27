# 10. A million records must not become a million objects

**Track:** Harborline Python · **Focus:** iterators, generators and single-pass ownership

## The next incident

Dispatch dependencies can now be replaced. The nightly manifest grows beyond memory, so parsing it into a full list before processing is no longer acceptable. Some sources can be consumed only once.

**Connection:** Continue after Change carrier and audit policy independently.

## First make the small version

Implement `prototype`: split a small list into consecutive lists of size size, returning a complete list of batches.

## Why the script has to change

Converting the source to list defeats streaming. Reading one extra record before yielding crosses a consumer’s backpressure boundary. Iterating the source twice loses records from a one-shot generator.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/tutorial/classes.html#generators).

## Your production task

Implement batches(source,size) as a lazy iterator of fresh lists of at most size items. Yield a short final batch, never an empty batch. Consume no source items before the first next(), and no more than one batch before each yield. size must be an exact positive int; raise ValueError when batches() is called, not only when iteration begins.

A generator function’s body starts on iteration, so immediate validation needs an outer callable boundary. This detail is observable API behavior, not just a syntax preference.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** Retry a transient outage without hiding a bad request.
