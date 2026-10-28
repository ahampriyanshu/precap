# Futures and executors

## A handle for a future result

Managing threads directly requires starting workers, coordinating their lifetime, and creating a result channel. An executor manages a pool of workers. Submitting a callable returns a `Future`: an object representing an operation that may be pending, running, completed, or cancelled. The future separates scheduling work from asking for its result.

`future.result()` waits if needed, returns the callable's result, and re-raises a callable's exception in the requesting thread. This is a major convenience compared with a raw thread, where joining alone does not propagate a worker failure. A timeout limits how long a caller waits; it does not automatically stop the underlying operation.

## Worked example

A future transfers a callable's failure back to the owner retrieving its result. The pool can still complete another submitted operation:

```python
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=2) as executor:
    valid = executor.submit(int, "42")
    invalid = executor.submit(int, "many")
    print(valid.result())
    try:
        invalid.result()
    except ValueError:
        print("conversion failed")
```

The outputs are `42` and `conversion failed`, in that order because retrieval is explicit. The tasks may complete in either order. Calling `result` again observes the same stored result or exception rather than resubmitting the callable. The context manager waits for submitted work during shutdown. These tiny conversions illustrate result ownership; pooling them would not be a performance improvement.

## Ordering and failure policy

`executor.map` yields in input order; `as_completed` exposes completion order. Ordered consumption can delay a fast result behind a slow earlier item. Keep indices when completion order is useful internally but presentation must be stable. Neither retrieval style makes other tasks disappear after one failure.

Cancellation only succeeds before execution starts. Events make that boundary observable without relying on a timing race:

```python
from concurrent.futures import ThreadPoolExecutor
from threading import Event

entered, release = Event(), Event()
def wait_for_release():
    entered.set()
    release.wait()
    return "done"

with ThreadPoolExecutor(max_workers=1) as executor:
    active = executor.submit(wait_for_release)
    try:
        entered.wait()
        queued = executor.submit(str, "never run")
        print(queued.cancel(), active.cancel())
    finally:
        release.set()
    print(active.result())
```

The outputs are `True False` and `done`. The first callable occupies the only worker, so the second remains pending and can be cancelled. Cancelling the running callable fails. Its explicit release signal is separate from the future's state. A `result(timeout=...)` timeout likewise stops the caller's wait, not the worker. Cooperative cancellation requires the callable to check a signal, and blocking external operations need their own timeouts. See [future cancellation](https://docs.python.org/3.12/library/concurrent.futures.html#concurrent.futures.Future.cancel).

## Practical uses and tradeoffs

Thread pools overlap independent blocking I/O; process pools add serialization and isolation for suitable CPU work. Set capacity according to downstream limits and measurement. Limiting worker count does not necessarily bound submission memory: Python 3.12's `Executor.map` collects its inputs eagerly. Later versions add controls, so check the runtime's API before designing a bounded stream. A window of submitted futures or a bounded producer-consumer queue can limit pending work explicitly.

Do not let every worker block waiting for another task submitted to the same exhausted pool. Keep pool ownership above a useful batch and always arrange shutdown. The `with` block can still wait for slow running tasks even when the body exits through an exception. An executor does not synchronize shared application state or undo side effects from failed work. Native thread pools are unavailable in the browser runner.

Further reading: [Executor shutdown](https://docs.python.org/3.12/library/concurrent.futures.html#concurrent.futures.Executor.shutdown).

## Practice

Run independent callables through a thread pool.

**Prototype:** `submit_one(function, value)` creates a `ThreadPoolExecutor` with one worker, submits one call, returns its result, and shuts down the executor. Worker exceptions propagate. The callable must execute in a worker thread.

**Final:** `map_in_threads(function, values, workers=2)` executes one call per value using a `ThreadPoolExecutor` with at most `workers` workers and returns a list of results in input order. `workers` is an integer and must be positive, even for empty input; otherwise raise `ValueError`. Empty input returns `[]`. Duplicates produce separate calls. Do not mutate the input. Propagate a worker exception to the caller and shut down the executor on success or failure. All submitted work must be finished when the function returns or raises. No cancellation policy or timing guarantee is required. Example: `(abs, [-2, 0, -1]) -> [2, 0, 1]`.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
