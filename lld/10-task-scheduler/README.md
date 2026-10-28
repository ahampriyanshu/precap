# Task Scheduler

## The problem

A task scheduler chooses pending work and temporarily assigns it to a worker. It owns task state, worker capacity, ordering, and the rules for accepting completion. A priority is only one part of that contract. The scheduler must also define ties, distinguish running work from completed work, and decide what happens when a worker stops reporting progress.

A lease gives an assignment a bounded lifetime. In this exercise, a lease expiring makes the task pending again; it does not prove the work finished. Workers may report completion only while their current lease is active. All time is caller-supplied logical time, so tests can exercise exact boundaries without sleeping.

## Naive approach

Keep an unsorted list of tasks. To dispatch, scan for a high-priority pending task and mark it assigned. Count running tasks for the worker to check capacity. This is adequate for a small scheduler if the lifecycle is explicit and every operation uses the same rules.

Worker identity alone accepts a completion from the wrong assignment:

```python
old_attempt = {"worker": "w1", "token": 1}
current = {"worker": "w1", "token": 2, "expires": 20}
accepted = old_attempt["worker"] == current["worker"]
print(accepted)
assert accepted
assert old_attempt["token"] != current["token"]
```

Reassigning the same task to the same worker makes the worker comparison pass. Assignment identity must change with every lease.

Problems arise when assignment is represented by a single boolean. A task cannot then distinguish pending, running, and done. An expired assignment may remain permanently unavailable, or completed work may accidentally reenter the queue. Sorting displayed identifiers also creates subtle ties: the string `"task_10"` sorts before `"task_2"`. Store numeric creation order separately from presentation.

## Where the naive approach breaks

A worker with capacity one leases task 1 at time 5 until time 10. At time 9, another dispatch must fail because that worker is full. At time 10, the lease has expired, task 1 is pending again, and its capacity slot is free. The interval is `[5, 10)`, so a completion arriving exactly at 10 fails.

Reassigning the same task, even to the same worker, requires a fresh lease token. Otherwise a delayed completion could finish the replacement attempt. Completion must match the current assignment, not just the task or worker identity.

## A better design

Separate a task map, worker capacities, and assignment metadata. Tasks have `pending`, `running`, or `done` status. Before any valid timed operation, expire leases whose boundary is at or before that operation's timestamp. Clear their assignment metadata and return those tasks to pending. Completion changes a matching running task to done and releases its slot immediately.

Make completion eligibility a predicate over the current assignment:

```python
def may_complete(current, token, now):
    return (current["status"] == "running"
            and current["token"] == token
            and now < current["expires"])

current = {"status": "running", "token": 2, "expires": 20}
print(may_complete(current, 1, 19), may_complete(current, 2, 20))
assert not may_complete(current, 1, 19)
assert not may_complete(current, 2, 20)
assert may_complete(current, 2, 19)
```

A stale token and an exactly expired lease both fail. The scheduler must evaluate and apply the transition together after validating logical time. External work can still continue after expiry; this predicate cannot fence another storage system.

Choose pending work by descending priority and ascending numeric task identifier. Dispatch changes exactly one task and returns a detached snapshot with its lease token and expiration. A failed dispatch must not consume an identifier or token or assign any task. Time advancement may still expire old leases, a defined lifecycle transition independent of whether the requested dispatch succeeds. Invalid time or duration arguments are rejected before that transition.

A direct implementation scans tasks for expiration, worker load, and the best candidate, using `O(T)` time per timed operation for `T` tasks. Sorting pending candidates instead costs `O(P log P)`. These costs are acceptable here and easier to verify than multiple mutable indexes. At larger scale, a ready heap, expiration heap, and per-worker active counts can reduce scans, but stale heap entries and count maintenance introduce additional invariants. The public contract should remain the same whichever representation is used.

## Real-world usage

Leases are useful for coordinating background work, rebuilding indexes, and distributing batch jobs. A capacity limit bounds simultaneous assignments; it is not a limit on requests per minute. This in-memory scheduler neither executes tasks nor prevents a worker from continuing after lease expiry. Real workers may need idempotent effects or a destination that rejects writes carrying old lease tokens. A token checked only by this object cannot undo an external side effect.

## Practice

Use only in-memory state. Names and worker identifiers are strings; priorities are arbitrary integers. Integer timestamps, durations, and capacities exclude booleans. There is no execution, sleeping, wall clock, threading, disk, or network.

**Prototype:** implement `PriorityQueue()`. `add(name, priority) -> int` creates a task with the next integer identifier starting at 1. Duplicate names are valid. `pop() -> tuple[int, str] | None` removes the highest-priority task, breaking ties by smaller identifier, and returns `(id, name)` or `None` when empty. Removed identifiers are never reused. Queues are independent.

**Final:** implement `TaskScheduler()`:

- `add_task(name, priority) -> int`: create a pending task with an increasing integer identifier starting at 1. Duplicate names and negative priorities are valid. Identifiers are never reused.
- `add_worker(worker_id, capacity) -> bool`: require a positive integer capacity, otherwise raise `ValueError` first. Register a worker and return `True`; duplicates return `False` without changing their original capacity.
- `dispatch(ts, worker_id, lease) -> dict | None`: require positive integer `lease`, otherwise raise `ValueError` before advancing time. After expiring old leases, return `None` if the worker is unknown, full, or no task is pending. Otherwise choose highest priority then smallest identifier, assign it on `[ts, ts + lease)`, and return its snapshot. Each successful dispatch receives the next globally increasing integer lease token starting at 1; failures do not consume tokens.
- `complete(ts, task_id, token) -> bool`: after expiry, return `True` only for a currently running task with exactly that token. Make it permanently done and clear assignment metadata. Wrong tokens, unknown tasks, completed tasks, and expired leases return `False` without a requested state change.
- `get_task(ts, task_id) -> dict | None`: after expiry, return its snapshot or `None` if unknown.
- `active(ts, worker_id) -> list[dict]`: after expiry, return snapshots of that worker's running tasks ordered by numeric task identifier. An unknown worker returns `[]`.

Every task snapshot has exactly these keys: `id`, `name`, `priority`, `status`, `worker`, `expires_at`, `token`. Status is `pending`, `running`, or `done`. Assignment fields are `None` for pending/done tasks. Every returned list and dictionary is a fresh snapshot.

Only the four methods taking `ts` advance time. Their valid calls, including calls returning `None` or `False`, accept nonnegative nondecreasing timestamps; equal times are allowed. A negative or regressing timestamp raises `ValueError` before any state or time change. All valid timed calls first expire leases with `expires_at <= ts`; expired tasks become pending and receive a new token if reassigned. Rejected requests otherwise preserve state. Instances share no tasks, workers, tokens, or clocks. Run `python main.py --stage prototype`, then `python main.py --stage final` (the default). Edit `exercise.py`; leave `main.py` unchanged.
