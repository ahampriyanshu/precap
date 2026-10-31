# Queues and backpressure

## A queue boundary also defines overload behavior

BlockingQueue coordinates producer/consumer visibility: actions before putting an element happen before actions after another thread takes that element. ArrayBlockingQueue has a fixed capacity, so a producer can block when consumers cannot keep up. An unbounded queue hides overload as memory growth. A nonblocking offer returns false at capacity; put waits interruptibly. Choose whether your API drops, rejects, waits, or times out rather than letting an incidental container choice define the policy.

```java
BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(1);
assert queue.offer(1);
assert !queue.offer(2);
assert queue.take() == 1;
```

Bounded queues limit queued work, not every resource in the system. Producers may retain unsent work, workers hold in-flight items, and downstream calls can still exhaust connections. Capacity sizing balances burst absorption, latency, and memory; buffering does not increase a slow consumer's steady-state throughput.

## Ownership during cancellation

Publishing a batch one element at a time is not an atomic transaction. If interruption arrives while waiting for capacity, a prefix may already be visible. Define that partial progress explicitly. Do not catch InterruptedException and keep publishing against the caller's cancellation. Poison pills can signal completion, but reserve a value outside the ordinary item domain and account for each consumer. Closing an executor does not automatically close a queue.

Tests should coordinate using latches, queue operations, and bounded waits. A sleep merely guesses when another thread progressed and often makes races intermittent. A queue's thread safety does not make a multi-operation check-then-act atomic; `if (!queue.isEmpty()) queue.take()` can still block after another consumer removes the last item. Use the operation that directly expresses the intended protocol.

## Practice

**Prototype:** `offerPrefix(BlockingQueue<Integer> queue,List<Integer> values) -> int` offers values in order without waiting, stops at the first false offer, and returns accepted count. Existing contents remain first, input list unchanged; never skip a rejected value and try later values.

**Final:** `publish(BlockingQueue<Integer> queue,List<Integer> values) -> void throws InterruptedException` puts every input value in order, waiting for capacity. Do not create an executor or a busy-wait loop. If interrupted while blocked, propagate InterruptedException and leave the already-published prefix committed; do not publish further values. Caller owns queue and producer thread lifetime. Inputs are nonnull integers; queue capacity is >=1.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
