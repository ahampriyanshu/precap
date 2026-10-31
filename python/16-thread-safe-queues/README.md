# Thread-safe queues

## Moving work instead of sharing every detail

A queue creates a communication boundary between producers and consumers. `queue.Queue` synchronizes its own `put` and `get` operations, so workers need not lock its storage themselves. FIFO delivery means removal follows insertion order; with several consumers, completion can still occur in another order. The queue does not protect unrelated state updated during processing.

Threaded queues pass references, not serialized snapshots. Submitting an object does not transfer exclusive ownership automatically:

```python
from queue import Queue

messages = Queue()
message = {"status": "new"}
messages.put(message)
message["status"] = "changed"
received = messages.get()
print(received is message, received["status"])
messages.task_done()
messages.join()
```

The output is `True changed`. The consumer receives the same dictionary after the producer's mutation. In concurrent code, that mutation could occur before, during, or after processing. Prefer immutable messages, create the required snapshot before submission, or agree that the producer stops accessing the object after handoff. Queue synchronization alone does not choose among those contracts.

## Blocking and capacity

`get()` waits when there is no item. A queue with `maxsize` greater than zero makes `put()` wait when full, limiting the backlog. This is backpressure: a producer cannot outpace consumers indefinitely. `get_nowait()` and `put_nowait()` raise `Empty` and `Full` rather than waiting. A capacity of zero means unbounded queue capacity, not a queue that can hold no items.

Checking `.empty()` and then calling `.get()` is unsafe as a coordination strategy because another worker can change the queue between those operations. Use the operation that expresses the desired behavior directly.

## Worked example

Queue capacity and unfinished work are separate counters. Removing an item frees storage capacity immediately, even before processing is acknowledged:

```python
from queue import Full, Queue

work = Queue(maxsize=1)
work.put("scan")
try:
    work.put_nowait("index")
except Full:
    print("backlog full")
first = work.get()
work.put_nowait("index")
print(first, work.get())
work.task_done()
work.task_done()
work.join()
```

The outputs are `backlog full` and `scan index`. After the first `get`, another `put` succeeds despite no `task_done` yet. `join` waits for matching acknowledgments of all submitted items, not for the queue to become empty or for worker threads to exit. This example acknowledges both tasks at the end only to expose the two counters; a worker normally acknowledges each item after its processing attempt.

## Stopping a worker

A consumer blocked in a loop needs a shutdown protocol. A sentinel is a reserved message meaning “stop.” In a single-producer batch, enqueue it after ordinary jobs and provide enough stop signals for every consumer. A unique object works for threads when producer and consumer share that same object identity. Identity assumptions do not carry unchanged across process serialization.

Handle the sentinel as a retrieved task: acknowledge it once and exit. Then join workers as well as waiting for queue acknowledgments. If producers are still submitting work, one producer's sentinel can arrive too early; coordinate producer completion before initiating shutdown. A timeout can help a worker check an external stop signal, but polling intervals and abandoned queued work still need policy.

## Common mistakes and tradeoffs

Call `task_done` exactly once per successful `get`, normally in `finally`. Acknowledgment says that the processing attempt is accounted for; it does not by itself mean business success. Record failures separately. If a worker dies and queued work remains without a consumer, `join` may wait forever. Excess acknowledgments raise `ValueError`; omitted acknowledgments prevent completion.

Do not use `empty` or `qsize` as a promise that the next operation will succeed: another worker can change the queue immediately. A positive `maxsize` bounds queued items, not all in-flight work or payload bytes. `SimpleQueue` omits capacity and task tracking when those features are unnecessary. Use process-aware facilities across processes. This lesson requires native Python.


## Practice

Implement one queue consumer before building a full worker pool.

**Prototype:** `make_queue(values)` returns a new unbounded `queue.Queue` containing every value in input order. It must not modify the input list. Empty input creates an empty queue.

**Final:** `square_worker(jobs, results)` repeatedly calls `jobs.get()`. An integer job produces its square via `results.put(square)`. The reserved sentinel `None` ends the worker without producing a result. Call `jobs.task_done()` exactly once for every retrieved item, including the sentinel, and return `None` after it. Items following the sentinel remain in `jobs`. Use a `finally` block so a failing `results.put` still acknowledges its job; propagate that exception to the worker's caller. Inputs otherwise do not raise. Example jobs `2, -3, None` produce `4, 9`. The tests invoke the worker directly for contracts and in a real native thread for integration; use no polling or sleeps.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
