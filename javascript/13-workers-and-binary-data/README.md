# Workers, binary data, and shared memory

A worker moves JavaScript execution into another agent so CPU work can run without occupying the page's main thread. Message passing establishes an explicit boundary between those executions. Binary buffers, transferable ownership, and shared memory offer different ways to move data across it, each with different correctness obligations.

## A worker is a separate execution environment

An ordinary dedicated worker has its own global context and cannot directly manipulate the document DOM. The page and worker exchange messages. A worker can run asynchronous APIs, but a long synchronous function still blocks that worker's own execution. The page can terminate the worker as a hard local stop; that does not undo external effects already dispatched.

```javascript
// Browser integration: analysis-worker.mjs must implement the matching protocol.
const worker = new Worker("/analysis-worker.mjs", {type: "module"});
worker.postMessage({requestId: 7, operation: "analyze", values: [1, 2, 3]});
worker.onmessage = ({data}) => { if (data.requestId === 7) console.log(data); };
```

Correlation IDs prevent an old result from replacing a newer request's state. Define message schemas, failure states, cancellation, and termination. Starting one worker per tiny operation can cost more than the saved work; a bounded pool may fit repeated heavy tasks.

## Binary views interpret bytes

ArrayBuffer owns a byte storage region. Typed arrays and DataView interpret its bytes. Different views can refer to the same storage, so modifying one view can affect another. DataView provides explicit byte-order access useful for wire formats.

```javascript
const buffer = new ArrayBuffer(4);
new DataView(buffer).setUint32(0, 0x01020304, true);
console.log([...new Uint8Array(buffer)]); // [4, 3, 2, 1]: little endian
```

Validate numeric ranges before writing. Typed numeric assignment can wrap, truncate, or round values, which is rarely the same as a domain's rejection rule. A format also needs length, version, bounds, and ownership checks; correct endianness alone does not make an untrusted binary message safe.

## Clone, transfer, or share

Structured cloning copies supported data structures. Transferring an ArrayBuffer moves its backing storage to the receiver and detaches it from the sender. Existing sender views then lose usable access to those bytes. Keep ownership clear so a later callback does not try to reuse a detached buffer.

SharedArrayBuffer instead gives agents access to shared storage. Concurrent writes require an explicit synchronization protocol with Atomics and an appropriate memory layout. In browsers, shared memory has cross-origin isolation requirements; do not assume it is available on every deployment. A shared buffer does not serialize a multi-field business invariant automatically.

## Test the protocol and its lifecycle

For transferable work, verify both the received bytes and the sender's detached state. For a pool, test capacity, worker failure, stale responses, and teardown. For shared state, reason about which atomic operation publishes completed data and which read observes it. Avoid using a busy-wait on the main thread as a substitute for a sound waiting protocol.

Most application code benefits first from smaller payloads and fewer redundant computations. Use workers and binary formats when measured computation or copying costs justify the extra lifecycle and protocol surface.

## Practice

Prototype: `encodeUint32(values)` returns a new ArrayBuffer holding every input Number as an unsigned 32-bit little-endian integer. Reject a noninteger, negative, too-large, nonfinite, or non-Number value with RangeError. Preserve the input.

Final: `transferBytes(buffer)` accepts an ArrayBuffer and returns a Uint8Array over the transferred buffer using structuredClone's transfer mechanism. Preserve all byte values in order; the original buffer must become detached. Do not implement a copying substitute. Empty buffers are valid.

Complete the exported stubs in `exercise.mjs`. The prototype and final stages have separate checks.

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Use Node.js 20+ locally, or the website's browser worker. Tests are standard-library only and check the documented behavior; they do not prove performance or force garbage collection.
