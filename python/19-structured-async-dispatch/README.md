# 19. Cancel the shipment group without orphaning work

**Track:** Harborline Python · **Focus:** async/await, semaphores, TaskGroup and cancellation

## The next incident

CPU checks have an explicit process boundary. Harborline now speaks to many async carrier APIs. A loop that awaits one request at a time wastes waiting time; unbounded create_task calls overwhelm the carrier and make failures leak orphan tasks.

**Connection:** Continue after CPU work needs a different boundary.

## First make the small version

Implement `prototype`: asynchronously fetch IDs one at a time and return results in input order.

## Why the script has to change

A semaphore limits concurrent activity, but by itself does not own task lifetimes. A failed sibling must cause the group to cancel and await the remaining tasks, allowing their finally blocks to release resources. Swallowing CancelledError defeats caller cancellation.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/library/asyncio-task.html#task-groups).

## Your production task

Implement async collect(ids,fetch,*,limit). Require a positive exact-int limit, run at most limit fetch calls concurrently and preserve order/duplicates. Use asyncio.TaskGroup to own tasks and a semaphore to limit active fetches. A fetch failure propagates as ExceptionGroup after siblings finish cancellation cleanup. Outer cancellation propagates as CancelledError after cleanup. Empty input returns []. No retry or real network access is needed.

Target Python 3.11+ because TaskGroup and ExceptionGroup are part of the exercise. The final distinction is ownership: concurrency starts work; structured concurrency also defines who must stop and await it.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** You have reached this track’s current endpoint. Revisit the assumptions and compare the alternatives you have built.
