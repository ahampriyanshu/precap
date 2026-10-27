# 17. Finish out of order, report in request order

**Track:** Harborline Python · **Focus:** ThreadPoolExecutor, futures and exception ownership

## The next incident

The explicit queue has a correct lifecycle. Some jobs simply fetch independent carrier statuses and do not need a custom queue protocol. A standard executor can own the workers while the API still promises results in request order.

**Connection:** Continue after The input desk must not outrun the workers.

## First make the small version

Implement `prototype`: fetch each requested ID sequentially, preserving duplicate requests and order.

## Why the script has to change

Appending from worker threads reports completion order instead of request order. Deduplicating IDs changes the number of calls. Returning on an exception while worker resources remain live violates the caller’s lifecycle expectations.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/library/concurrent.futures.html).

## Your production task

Implement fetch_ordered(ids,fetch,*,workers). Use ThreadPoolExecutor with at most workers concurrent fetches; preserve input order and duplicates. Ordinary fetch exceptions propagate to the caller after the executor cleans up running work. No retry, deduplication or special per-item error conversion. Validate a positive exact-int workers value even for empty input. Inputs are finite; streaming/backpressure is not promised.

Executor.map preserves input order but may submit eagerly on the Python versions targeted here. This exercise intentionally does not promise bounded input consumption; the preceding queue lesson supplies that different contract.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** CPU work needs a different boundary.
