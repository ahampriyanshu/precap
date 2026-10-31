# Async iteration, streams, and backpressure

Large files, message feeds, and result sets should not require one enormous in-memory array before useful processing begins. Async iteration lets the consumer request the next asynchronous value. Streams add buffering and flow-control mechanisms around incremental data. The useful property is a bounded relationship between production and consumption.

## Async iteration makes demand explicit

An async iterable provides Symbol.asyncIterator and an iterator whose next result can be awaited. for-await-of handles this protocol and can also consume synchronous iterables. An async generator expresses production with yield while preserving its suspended state between requests.

```javascript
async function* records() { yield 1; yield 2; }
const received = [];
for await (const record of records()) received.push(record);
console.log(received); // [1, 2]
```

Converting the source to an array removes its incremental memory advantage. A wrapper should retain only the bounded state needed for its operation, such as one batch or a small concurrency window.

## A batch changes both latency and memory

Batching amortizes per-call overhead but delays small groups while waiting for enough work. Define when a partial batch is emitted: normal end, timer, explicit flush, or another boundary. A time-based flush introduces scheduling and cancellation semantics that a count-only batch does not have.

A count-bounded batcher should stop requesting source values while its yielded batch waits for a consumer. If it launches an independent background producer into an unbounded queue, the apparent pull API no longer establishes backpressure.

## Web Streams add buffering contracts

ReadableStream, TransformStream, and WritableStream provide platform interfaces for incremental byte or object processing. A high-water mark affects when more production is requested; it is not a universal hard cap on every buffer held by a pipeline. Awaiting a writer's readiness/completion can propagate downstream capacity.

```javascript
const stream = new ReadableStream({
  start(controller) { controller.enqueue("ready"); controller.close(); }
});
const reader = stream.getReader();
try { console.log((await reader.read()).value); }
finally { reader.releaseLock(); }
```

This example reads one closed source. A real pipeline needs a policy for cancellation, failed writes, partial output, and the ownership of the reader/writer. Releasing a reader lock and canceling its source are different operations.

## Errors and early exit close the lifecycle

If a source fails halfway through a batch, emitting that partial batch as though it were complete may violate the destination's contract. If a consumer stops after one result, close the upstream iterator so it can release its cursor or subscription. Preserve the source error and observe cleanup failures according to a declared policy.

A durable export needs more than streaming: checkpoint identity, replay-safe writes, publication rules, and authorization remain separate. Streaming bounds the live data path; it does not establish that a partially written object is a complete business result.

## Practice

Prototype: implement async generator `fromIterable(iterable)`, yielding each source value in order and awaiting promised values. Keep object identity and propagate failure.

Final: implement async generator `batchStream(source, size)`. Accept an async or sync iterable. size is a positive safe integer or throws RangeError when consumed. Yield fresh arrays of at most size values; emit a final partial batch only on normal completion. Read no further while a yielded batch awaits consumer demand. Close the source on consumer break; if source fails, propagate it without flushing a partial batch.

Complete the exported stubs in `exercise.mjs`. The prototype and final stages have separate checks.

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Use Node.js 20+ locally, or the website's browser worker. Tests are standard-library only and check the documented behavior; they do not prove performance or force garbage collection.
