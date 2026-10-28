# Message Broker

## The problem

A message broker separates publishing work from processing it. A publisher adds an identified message, and consumer groups read the messages independently. Reading a message does not prove that its work completed: a group must acknowledge success or report failure. The broker therefore owns both retained message content and the delivery state of each group. These are different responsibilities with different lifetimes.

The key invariant is independence. If the reporting group acknowledges a message, the billing group must still be able to read it. Within a group, an acknowledgment must refer to the currently delivered message. A failure must eventually stop automatic retries, otherwise one bad message can prevent all later work from being reached.

## Naive approach

A list provides a straightforward FIFO queue: append new messages and remove the first item when a consumer asks for work. Add a Boolean `processed` field to each message, and flip it after successful handling. For a single consumer that never fails, this model can be sufficient. It also makes the central limitation visible: processing status is stored globally rather than per reader.

A destructive queue cannot represent independent reader progress:

```python
from collections import deque

messages = deque(["m1", "m2"])
group_a = messages.popleft()
group_b = messages.popleft()
print(group_a, group_b)
assert group_b != "m1"
```

Group B missed m1 because A’s delivery removed the shared record. Faster head removal improves performance but leaves this ownership error intact.

Replacing `list.pop(0)` with `deque.popleft()` improves removal from the head. A list must shift the remaining references, costing O(N); a deque supports efficient operations at its ends. However, changing the container does not establish independent delivery state for several groups.

## Where the naive approach breaks

A destructive pop removes the only retained copy before slower groups can read it. A global processed flag has the same problem. Giving each group a queue of message references can work, but publishing now touches every group and creates additional per-group queue storage. A shared log with cursors offers a different tradeoff.

Failures expose another ambiguity: does calling `poll` twice mean two attempts, or is the second call observing the same outstanding delivery? Without an explicit rule, polling can exhaust the retry limit accidentally. Late or duplicate acknowledgments can also skip the wrong message if the broker advances a cursor without validating the message identifier.

## A better design

Keep an append-only list of message records and a unique-ID set. Each group owns a cursor, an attempt counter for its current position, an optional in-flight delivery, and a dead-letter list. This exercise allows one outstanding delivery per group, which makes ordering and retry behavior precise. Acknowledgment advances that group's cursor; it never removes the shared record.

Keep retained records separate from group cursors:

```python
log = ("m1", "m2")
cursors = {"A": 0, "B": 0}
in_flight = {"A": log[cursors["A"]]}
assert in_flight["A"] == log[cursors["A"]]  # Repeated poll is unchanged.
cursors["A"] += 1  # An acknowledged delivery advances A only.
print(log[cursors["A"]], log[cursors["B"]])
assert log[cursors["B"]] == "m1"
```

A now sees m2 while B still sees m1. This representation fragment omits acknowledgement validation, retries, and dead-letter transitions; those operations must update only the addressed group’s delivery state.

Expected hash lookup and list indexing costs are O(1). Publishing appends once rather than once per group. Poll, acknowledgment, and rejection take O(1) excluding output copying; listing D dead letters takes O(D). Keeping the entire log is intentionally simple but consumes O(M) message storage forever. A reclaiming design needs a retention rule and must account for the slowest relevant group. A deque alone does not solve that policy decision.

## Real-world usage

Independent progress appears in event processing, notification delivery, and background work systems. Acknowledgments coordinate broker state with a worker's report; they do not make external side effects happen exactly once. A worker can complete an action and fail before acknowledging it, so downstream operations often need idempotency keys. This exercise models explicit failures in sequential memory. It excludes worker crashes, delivery timeouts, durable storage, partitions, backoff scheduling, and dead-letter replay. Those features add further state transitions rather than changing the need for per-group ownership.

## Practice

Inputs have the documented types. Message IDs, group IDs, and payloads are strings; empty strings are allowed. Payloads are immutable strings. All snapshots and returned lists must be fresh. Instances are independent. There is no clock, capacity limit, deletion, replay, or automatic delivery timeout.

**Prototype:** implement `MessageQueue()` with `publish(message_id, payload) -> bool` and `consume() -> dict | None`. Publish returns `True` once per ID across the queue's lifetime, including IDs already consumed; a duplicate returns `False` without replacing content. Consume destructively returns the oldest `{"id": id, "payload": payload}` or `None` when empty.

**Final:** implement `MessageBroker(max_attempts=2)`:

- `max_attempts` is an integer; values below 1 raise `ValueError`. It counts deliveries, including the initial delivery.
- `publish(message_id, payload) -> bool` appends to a retained FIFO log. IDs remain unique for the broker's lifetime. Duplicate IDs return `False` and preserve the original payload.
- `subscribe(group_id) -> bool` creates a group starting at the earliest retained message, including messages published before subscription. Return `False` if already subscribed; preserve existing progress.
- `poll(group_id) -> dict | None`: unknown or caught-up groups return `None`. Otherwise return exactly `{"id": id, "payload": payload, "attempt": n}`. The first delivery at a position has attempt 1. An already in-flight delivery is returned again without incrementing its attempt. After a retryable rejection, poll redelivers the same message with the next attempt before any later message.
- `ack(group_id, message_id) -> bool`: return `True` only for that group's current in-flight ID, clear it, and advance to the next log position. Unknown groups, wrong IDs, duplicate acknowledgments, and acknowledgments between rejection and redelivery return `False` without changing state.
- `nack(group_id, message_id) -> str | None`: only a matching in-flight delivery is valid. Invalid calls return `None` unchanged. A valid call clears in-flight state. If its attempt is below the limit, return `"retry"` without advancing. At the limit, append `{"id": id, "payload": payload, "attempts": n}` to that group's dead letters, advance, reset attempts for the next message, and return `"dead-letter"`.
- `dead_letters(group_id) -> list[dict]`: return detached entries in failure order, or `[]` for an unknown group. Reading does not drain the list.

A rejected publish or invalid acknowledgment must not affect any group. Run `python main.py --stage prototype`, then `python main.py --stage final` (the default). Edit only `exercise.py`.
