# 16. The input desk must not outrun the workers

**Track:** Harborline Python · **Focus:** bounded queues, task accounting and graceful shutdown

## The next incident

Reservations are atomic. A background desk now processes manifests with multiple threads. An unbounded queue grows during slow carrier responses, and one failed item currently prevents queue.join() from returning.

**Connection:** Continue after Two dispatchers reserve the last crate.

## First make the small version

Implement `prototype`: apply a successful handler to a small finite list sequentially and return results.

## Why the script has to change

Every successful get requires task_done, even when the handler fails or a shutdown sentinel is received. Workers must stop and be joined; daemon threads are not cleanup. Bounded input provides backpressure, but returned results still require O(n) storage.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/library/queue.html).

## Your production task

Implement process(items,handler,*,workers,max_pending,queue_factory=Queue). Use a queue created with maxsize=max_pending and workers non-daemon threads. Return ordered (True,result) entries or (False,"ExceptionType: message") for ordinary handler exceptions; call each input once. Use sentinels and task accounting and join all workers before returning or propagating a source-iteration error. Require positive exact-int workers/max_pending. Inputs are finite. BaseException raised by handlers is outside this contract.

Shutdown is a protocol, not a boolean flag. Handler failures become per-item outcomes, while producer failures remain call-level exceptions after cleanup. Do not confuse these two failure domains.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** Finish out of order, report in request order.
