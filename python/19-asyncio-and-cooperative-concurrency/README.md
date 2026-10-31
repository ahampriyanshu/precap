# Asyncio and cooperative concurrency

## Concurrency through cooperation

`asyncio` coordinates tasks on an event loop. An `async def` function defines a coroutine function; calling it creates a coroutine object. The body runs when that coroutine is awaited or scheduled as a task. A task can pause at `await`, allowing the loop to run other work while an asynchronous operation is waiting.

This is useful for many independent network operations when the libraries involved support asynchronous I/O. It does not automatically make CPU work parallel. A long calculation or a blocking `time.sleep()` inside a coroutine prevents the same event loop from making progress. Use asynchronous APIs such as `await asyncio.sleep(...)`; deliberate native integrations may offload blocking work elsewhere.

## Worked example

Scheduling creates overlapping tasks; the result collector chooses presentation order. This is a complete standalone script:

```python
import asyncio

async def label(value):
    await asyncio.sleep(0)
    return f"item-{value}"

async def main():
    tasks = [asyncio.create_task(label(n)) for n in (2, 1)]
    print(await asyncio.gather(*tasks))

if __name__ == "__main__":
    asyncio.run(main())
```

The output is `['item-2', 'item-1']`. `gather` preserves its input order regardless of completion order. `sleep(0)` suspends to let other tasks run; it is not a simulated network benchmark. In a notebook or browser runner with an existing loop, define the functions and use `await main()` instead of the guarded `asyncio.run` entry point. Calling `asyncio.run` inside an active loop raises `RuntimeError`.

## Scheduling and capacity

Awaiting one coroutine and then another is sequential. Creating several tasks before awaiting their results allows overlap. Keep references to tasks and arrange for them to finish; starting background tasks without ownership can leave unfinished work and unobserved exceptions.

A semaphore bounds how many tasks enter a protected region at once. Use `async with semaphore:` around the actual awaited operation, not only around task creation. This limits active requests, but still creating a task for every item may use substantial memory. A worker-queue design can also bound the number of queued tasks when inputs are very large.

## Errors and cancellation

Cancellation requests are delivered cooperatively, usually at a suspension point. Cleanup should release owned state and normally allow `CancelledError` to propagate. An event makes cancellation after startup deterministic here:

```python
import asyncio

async def worker(started, events):
    try:
        started.set()
        await asyncio.Event().wait()
    finally:
        events.append("released")

async def main():
    started, events = asyncio.Event(), []
    task = asyncio.create_task(worker(started, events))
    await started.wait()
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print(events, task.cancelled())

if __name__ == "__main__":
    asyncio.run(main())
```

The output is `['released'] True`: cancellation is observed only after the worker's cleanup has run. A cancellation request is not proof that a task has stopped; await its completion. A task can suppress cancellation, but doing so can break structured timeout and task-group behavior. Cancelling an await on an offloaded blocking function also does not forcibly stop that underlying thread.

With default `gather`, one exception is propagated while other submitted awaitables can continue. Python 3.11+ `TaskGroup` cancels remaining siblings after an ordinary child failure and waits for their cleanup; multiple failures can be reported as an exception group. Choose the batch failure policy deliberately.

## Common mistakes and tradeoffs

An `await` may complete immediately, so it is not always a scheduling yield. Conversely, any operation that really suspends can let another task modify shared state before execution resumes. Protect invariants that span awaits, or restructure updates to avoid exposing a partial transition. Ordinary synchronous CPU work blocks the event loop even inside `async def`.

Keep tasks owned and exceptions observed. A semaphore limits active operations but does not bound memory from creating millions of waiting tasks. Use bounded submission or workers consuming a queue for large streams. Keep loop-bound coordination objects within the lifetime of their intended loop. Synchronous code remains simpler when there is no independent waiting to overlap.


## Practice

Run asynchronous operations with an explicit concurrency limit.

**Prototype:** `async def double_later(value)` yields control using `await asyncio.sleep(0)` and returns `value * 2` for an integer input.

**Final:** `async def async_map(values, operation, limit=2)` calls async callable `operation(value)` exactly once per value and returns results in input order. Limit active operation calls to at most `limit` with an `asyncio.Semaphore`. Schedule independent work concurrently; with at least two values and limit 2, two operations must be able to enter before either completes. `limit` is an integer; values below 1 raise `ValueError`, even on empty input. Empty input gives `[]`. Do not mutate the input. On any operation failure or caller cancellation, cancel and await unfinished sibling tasks before propagating the original failure or cancellation. Do not leave background tasks running. Inputs are finite lists, so one task per value is acceptable. Use no real network or blocking sleep. Await this API in browser code; `main.py` manages its own loop for native CLI tests.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
