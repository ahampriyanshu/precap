# JavaScript: execution, asynchronous work, and memory

JavaScript added programmable behavior to documents. Browsers then needed to coordinate that behavior with input, networking, timers, and rendering without allowing two ordinary page handlers to mutate the same document simultaneously.

The execution model remains central even when a framework hides event handlers. `async` syntax makes waiting readable; it does not make CPU work parallel or protect an interface from long tasks.

## Jobs run to completion

Within a browser agent, a JavaScript job completes before another job interrupts it. The host schedules tasks such as timer callbacks and input handling. Promise reactions and `queueMicrotask` callbacks use the microtask queue; checkpoints drain that queue before continuing to later tasks and rendering opportunities.

```javascript
console.log("A");
setTimeout(() => console.log("D"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("B");
// A, B, C, D
```

A zero-delay timer is eligible later, subject to scheduling and throttling. It is not a deadline. A self-replenishing microtask chain can starve input and rendering. Splitting expensive work across promises therefore does not necessarily yield to the browser.

![An input task schedules promise microtasks; the browser drains them before a rendering opportunity and a later timer task.](/diagrams/frontend-event-loop.svg)

Rendering does not have to occur after every task. Background tabs, display refresh rate, browser scheduling, and available work affect opportunities. Reason about whether work can block a frame, then inspect a trace rather than assuming a universal 16 ms timer.

## Values, identity, and closures explain state bugs

Objects have identity; assigning an object to another variable copies the reference. Spreading an object copies only its top level. A nested object remains shared unless copied independently.

```javascript
const original = { owner: { name: "Ada" }, tags: ["open"] };
const shallow = { ...original };
shallow.owner.name = "Grace";
console.log(original.owner.name); // Grace

const changed = {
  ...original,
  owner: { ...original.owner, name: "Lin" },
};
console.log(changed.owner === original.owner); // false
```

Immutable updates make ownership and change detection predictable; deep-copying an entire application state on every event is usually wasteful. Copy the path that changes, normalize repeated entities when useful, and keep the authoritative object in one place.

A closure retains its lexical environment. A delayed callback can observe a particular render's value or a mutable shared binding depending on how it was created. This matters for debounced handlers, subscriptions, and React effects. Decide whether the callback needs a snapshot or the latest value; do not blindly suppress dependency warnings.

## Move or divide CPU work deliberately

For modest work, process bounded chunks and yield between chunks. For substantial independent computation, a Worker provides another execution context. WebAssembly can improve suitable computation or reuse native libraries, but it still consumes CPU and can block the thread where it runs.

This Worker fragment sums numeric data transferred from a browser page:

```javascript
// sum-worker.js
self.onmessage = ({ data: buffer }) => {
  const numbers = new Float64Array(buffer);
  let total = 0;
  for (const value of numbers) total += value;
  self.postMessage(total);
};
```

The page transfers ownership of the buffer rather than cloning it:

```javascript
const worker = new Worker("/sum-worker.js");
const numbers = new Float64Array([12, 18, 30]);
worker.onmessage = event => {
  console.log(event.data); // 60
  worker.terminate();
};
worker.postMessage(numbers.buffer, [numbers.buffer]);
// numbers.buffer is now detached; do not continue using it.
```

The page owns lifecycle, error handling, and cancellation. A production worker protocol needs request IDs when multiple jobs overlap, bounded queues, and a failure policy. Workers cannot directly update the DOM; results cross back to the main thread for display. Shared memory requires additional isolation and synchronization rules and is a separate design decision.

## Cancellation is an ownership decision

When a view disappears, its requests, timers, observers, and subscriptions often become obsolete. An `AbortController` can coordinate APIs that accept a signal:

```javascript
const scope = new AbortController();
window.addEventListener("resize", () => {
  console.log(window.innerWidth);
}, { signal: scope.signal });

// Called when this feature is disposed.
scope.abort();
```

Aborting a fetch does not prove that a remote mutation was cancelled. The server may already have accepted it. Cancellation reduces local work; an idempotency and status contract resolves uncertainty about writes.

## Garbage collection follows reachability

JavaScript garbage collectors reclaim objects that are no longer reachable through the runtime's roots. A retained object is not collectible simply because the user closed its panel. A global cache, listener, interval, or closure can preserve the path to it.

Common leaks include detached DOM nodes held by application objects, caches without bounds, repeated observers without disconnect, and object URLs never revoked. `WeakMap` is useful when metadata should not keep its object keys alive; it is not a general bounded cache and cannot be enumerated to implement eviction policy.

Use explicit cleanup for external resources. Garbage collection does not provide a reliable deadline for releasing a socket, cancelling a timer, or committing a file. Avoid finalization hooks for correctness-critical cleanup because collection and callback timing are not guaranteed.

## Prove a leak or scheduling problem

Record repeated equivalent operations: open and close the editor twenty times, let pending work settle, and compare retained objects. A heap that rises and falls can be healthy allocation; a persistent retaining path explains a leak.

For interaction stalls, separate JavaScript execution, garbage collection, style/layout, and rendering in the performance trace. A 300 ms task containing a sort needs a different change from 300 ms of forced layouts. Keep the ownership and scheduling models explicit before adding another library or asynchronous wrapper.
