# Concurrency, scheduling, and backpressure

Servers need concurrency because a request spends much of its lifetime waiting: for sockets, locks, connection pools, disk, or another service. Early process-per-request servers were straightforward but expensive at large connection counts. Threads shared memory more cheaply; event loops avoided dedicating an execution stack and operating-system thread to every idle connection. Each model still has finite resources.

The useful question is not whether a framework is asynchronous. It is where work waits, what capacity it holds while waiting, and how the system refuses work it cannot finish.

## Separate concurrency from parallelism

Concurrency allows operations to overlap; parallelism executes work simultaneously. An event loop runs tasks cooperatively until they suspend. A synchronous database call inside an async handler prevents the loop from serving other tasks during that call. CPU-bound serialization, compression, or a large regular expression can have the same effect.

This Python integration fragment overlaps independent asynchronous operations:

```python
import asyncio

async def load_dashboard(database, pricing_client):
    async with asyncio.TaskGroup() as group:
        orders = group.create_task(database.open_order_count())
        prices = group.create_task(pricing_client.current_prices())
    return {"orders": orders.result(), "prices": prices.result()}
```

The clients must actually provide nonblocking I/O. They need their own limits and timeouts. If either operation fails, `TaskGroup` cancels the remaining task and waits for its cleanup. Cancellation does not undo a remote mutation that already committed, so parallelizing side effects requires separate correctness reasoning.

Threads can overlap blocking I/O. CPU parallelism in Python depends on the interpreter build and extension behavior; do not assume all Python deployments share the same GIL characteristics. Processes or compute workers provide a clearer isolation boundary for substantial CPU work. Executors need bounded submissions: moving work out of the event loop into an unlimited executor queue merely moves the backlog.

## Capacity is a chain of queues

The ingress connection queue, application admission queue, worker scheduler, database pool, database lock queue, and outbound client pool are separate waiting rooms. A request can consume one scarce resource while waiting for another.

![Requests enter a bounded admission queue, then execution slots, then a smaller dependency pool; excess requests are rejected before the dependency is saturated.](/diagrams/backend-backpressure.svg)

Consider four API replicas, each configured for 40 database connections. They can request 160 connections before migration jobs or workers connect. Adding four replicas doubles that demand. Size the global connection budget first, then allocate it across workloads and deployment overlap. A database proxy can improve connection management; it cannot double query execution capacity.

Little's law gives a useful steady-state check:

```text
average in-flight work = arrival rate × average time in the boundary

800 requests/second × 0.15 seconds = 120 average in-flight requests
800 requests/second × 1.50 seconds = 1,200 average in-flight requests
```

The second line can result from a dependency slowdown with unchanged traffic. Ten times as many requests now retain memory and possibly connections. This arithmetic uses averages in a stable boundary; substituting p99 latency does not calculate p99 concurrency. Use measured distributions and load tests for peak limits.

## Bound admission before work multiplies

A semaphore bounds active work, but unlimited tasks waiting on the semaphore still consume memory. Combine a small waiting budget with a deadline and an explicit rejection policy. This executable example demonstrates bounded waiting for one dependency, not a complete HTTP server:

```python
import asyncio

class Busy(Exception):
    pass

async def bounded_call(slots, operation):
    try:
        async with asyncio.timeout(0.02):
            await slots.acquire()
    except TimeoutError as error:
        raise Busy("dependency admission budget exhausted") from error
    try:
        async with asyncio.timeout(0.20):
            return await operation()
    finally:
        slots.release()

async def main():
    slots = asyncio.Semaphore(2)
    async def example_io():
        await asyncio.sleep(0.001)
        return "ok"
    print(await bounded_call(slots, example_io))

asyncio.run(main())
```

An actual service also limits admitted HTTP requests, payload size, and total pending tasks. Use tenant quotas where a single tenant could monopolize shared slots. Reserve capacity for health checks and operational traffic rather than letting an expensive export starve all interactive work.

Backpressure means a downstream capacity signal changes upstream behavior: pause consumption, reduce concurrency, reject admission, or slow a producer. Accumulating an unbounded list of pending tasks is buffering, not backpressure.

## Cancellation and resource ownership

Every acquisition needs cleanup on success, failure, timeout, and cancellation. Use context managers for pools and streaming response bodies. An unconsumed HTTP response may retain its connection; a forgotten database transaction may retain locks even after the user has left.

Do not swallow cancellation in a broad exception handler. If cleanup needs a short protected interval, bound that interval and document the resource it preserves. Long detached work belongs in a durable job system, not in a coroutine whose lifetime is accidentally tied to a request.

Graceful shutdown follows ownership in reverse: stop admitting new work, become unready, drain useful in-flight work within a deadline, release resources, then exit. A process killed halfway through work still requires idempotency or recovery; graceful termination reduces disruption but cannot establish correctness by itself.

## Measure useful work under overload

A good load test increases offered traffic beyond capacity and reports completed useful operations, rejections, queueing delay, and tail latency. A system that keeps accepting requests while completing fewer of them is degrading even if its HTTP server has not crashed.

Use pool wait time, active concurrency, queue age, event-loop lag, CPU, and dependency duration together. Low CPU with high latency often indicates waiting; adding CPU or replicas may increase contention. Find the constrained boundary and protect it before changing the execution model.
