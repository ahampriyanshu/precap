# Threads and locks

## Concurrency inside one process

A thread is an independently scheduled path of execution within a process. Threads share ordinary Python objects, so one thread can observe changes made by another. They are useful for overlapping blocking I/O, such as waiting for independent file or network operations. They also introduce coordination problems: operations can interleave in an order that is difficult to predict.

In ordinary GIL-enabled CPython, the global interpreter lock limits simultaneous execution of Python bytecode. It does not make a multi-step business operation atomic. Some libraries release the GIL, and optional free-threaded CPython builds have different execution behavior. Write synchronization based on the shared-state rule, not assumptions about a particular interpreter's scheduling.

## Starting and joining

Construct `Thread(target=function, args=(... ,))`, call `.start()`, and later `.join()` to wait for completion. Calling `.run()` directly is an ordinary call in the current thread. Starting all threads before joining allows their work to overlap; starting and immediately joining each thread serializes the work. A thread object can only be started once.

## Worked example

```python
from threading import Lock, Thread

numbers = []
lock = Lock()

def record(value):
    with lock:
        numbers.append(value)

threads = [Thread(target=record, args=(n,)) for n in (1, 2)]
for thread in threads:
    thread.start()
for thread in threads:
    thread.join()
print(sorted(numbers))
```

The result is `[1, 2]`. The append order is unspecified because either worker may acquire the lock first. Joining establishes that both workers have finished before the result is inspected. Sorting makes this demonstration's output deterministic; it does not alter the execution order.

## Locks protect invariants

A lock protects a rule spanning operations, not merely an isolated assignment. A check followed by an update must be one critical section if another worker could intervene. This shared reservation is either accepted in full or rejected:

```python
from threading import Lock, Thread

remaining = 3
lock = Lock()
def reserve_two():
    global remaining
    with lock:
        if remaining >= 2:
            remaining -= 2

threads = [Thread(target=reserve_two) for _ in range(2)]
for thread in threads:
    thread.start()
for thread in threads:
    thread.join()
print(remaining)
```

The output is `1` regardless of which thread wins the lock. Exactly one reservation can satisfy the condition. Moving the check outside the lock would split the invariant across an interleaving point. All readers and writers that depend on consistent state must follow the same locking rule. The module global keeps this example small; an owning object can encapsulate both state and its lock in an application.

Use `with lock` so ordinary exceptions release it. A lock is not a database transaction: if several updates happen and one raises, earlier updates remain. Validate before mutation or arrange rollback when required. Returning a snapshot avoids exposing an internal container to mutation outside the locking protocol.

A successful `join` covers only that worker's lifetime. It does not prevent a different, still-running worker from changing shared state after the join returns.

## Tradeoffs and common mistakes

Keep critical sections short and avoid calling unknown callbacks or blocking I/O while holding a lock. Another thread may need the same lock to complete the operation being awaited. When several locks are needed, a consistent global acquisition order can prevent a common deadlock cycle. `RLock` permits reentry by its owner but does not resolve arbitrary lock-order deadlocks.

More threads can increase scheduling overhead and overload downstream services. CPU-heavy pure Python often benefits more from processes on GIL-enabled builds. Joining a raw thread waits for termination but does not re-raise its exception in the joining caller; a future offers a result and failure channel. Daemon threads can stop abruptly at shutdown, so essential cleanup needs explicit ownership and joins. This lesson requires native Python because the browser runtime does not provide ordinary operating-system threads.

Further reading: [Threading reference](https://docs.python.org/3/library/threading.html).

## Practice

Count words while several threads share a result.

**Prototype:** implement `SafeCounter()` with `increment()` and read-only `value`. It starts at 0; every increment adds exactly 1 and returns `None`. Protect both updates and reads with a `threading.Lock` so concurrent increments are safe.

**Final:** `count_words(chunks)` accepts a list of iterables of strings. Start one real `threading.Thread` per chunk, consume each chunk in that worker, and return a dictionary of total word counts only after all threads are joined. Matching is case-sensitive; empty strings and duplicates are counted. Empty `chunks` returns `{}`. Do not modify input lists. Protect shared count updates with one lock. Example: `[["a", "b"], ["a"]] -> {"a": 2, "b": 1}`. Chunk iteration is assumed not to raise. Scheduling and dictionary iteration order are unspecified. Native Python is required; no performance threshold is tested.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
