# Memory, garbage collection, and performance

Garbage collection automates reclamation of memory that is no longer reachable. It replaced much manual allocation bookkeeping for ordinary application objects, but it cannot decide which reachable data your product no longer needs. A memory leak in JavaScript often consists of perfectly valid references retained by the wrong lifetime owner.

## Reachability explains retention

Roots such as active globals, stacks, pending callbacks, and runtime-managed handles can keep an object graph alive. A cycle is not inherently a leak when the entire cycle becomes unreachable. A global Map, an attached listener, or a closure retaining a removed view can keep otherwise unused records reachable.

```javascript
const retained = new Map();
let record = {payload: new Uint8Array(1024)};
retained.set("latest", record);
record = null; // the Map still owns a strong reference
console.log(retained.size); // 1
```

Setting one local variable to null does not invalidate the other references. Likewise, deleting a visible DOM element does not guarantee that listeners, timers, caches, or framework registries released it. Inspect retaining paths and ownership rather than treating one assignment as a universal cleanup technique.

## Collection has execution and memory costs

Engines use strategies such as generational collection and incremental/concurrent work, with details that vary by runtime. Allocation rate, surviving objects, large buffers, and retained graphs affect cost. A temporary heap increase can be ordinary allocation; continuously rising retained memory after comparable work is a stronger leak hypothesis.

Measure representative workloads and repeated lifecycles. A heap snapshot shows objects and retaining relationships at a point in time, while an allocation profile shows where allocations originate. Native buffers and external resources can have costs beyond a simple count of JavaScript objects. Avoid conclusions from one noisy memory reading.

## Weak references do not provide a correctness clock

WeakMap keys do not keep their object keys alive merely because they are keys. This suits metadata whose lifetime should follow another object. WeakRef and FinalizationRegistry expose weaker lifetime observations, but collection and finalization are nondeterministic. A finalizer is not a reliable way to close a transaction or perform required cleanup.

Use explicit unsubscribe, abort, close, and dispose operations for resources and callbacks. Make teardown idempotent and test it directly. GC can reclaim the resulting unreachable objects later; the application should not need to guess when that happens.

## Bound retention before tuning a collector

A debug history retaining every state snapshot can grow forever. A capacity-limited history makes its policy visible; a cache also needs freshness and permission boundaries. Memoization, pooled objects, and reusable buffers trade allocation for retained state and can hurt if their lifetimes are too broad.

```javascript
const history = ["a", "b", "c", "d"];
console.log(history.slice(-2)); // bounded recent values: ["c", "d"]
```

A count limit alone does not bound bytes when individual entries vary greatly. For large payloads, consider a byte budget and a clear eviction owner. Optimize the measured constrained path: reducing an avoidable quadratic loop may matter more than changing allocation style.

## Test lifecycles without forcing garbage collection

A subscription API should say whether publish snapshots the listener set, whether new listeners join the current publish, what happens when one throws, and whether dispose invalidates future registration. Those observable promises can be tested deterministically. Avoid a test that requires the GC to collect an object within a fixed delay; that turns a language runtime policy into a flaky application requirement.

## Practice

Prototype: `retainRecent(values, capacity)` returns a new array containing the newest at most capacity items in original order. capacity is a nonnegative safe integer or throws RangeError. capacity=0 returns []; preserve item identity and caller input.

Final: implement `EventHub` with `subscribe(listener)`, `publish(value)`, `size()`, and `dispose()`. Each registration is independent, even for the same function. subscribe returns an idempotent unsubscribe function. publish snapshots current registrations, invokes all of them in registration order (including one removed during this publish), and reports listener failures together in AggregateError after invoking the rest. A listener added during publish starts with the next publish. dispose is idempotent, removes all registrations, and makes future subscribe throw Error. If a listener calls dispose during publish, all remaining listeners in that current snapshot still run (and their failures still aggregate); only later publish calls do nothing.

Complete the exported stubs in `exercise.mjs`. The prototype and final stages have separate checks.

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Use Node.js 20+ locally, or the website's browser worker. Tests are standard-library only and check the documented behavior; they do not prove performance or force garbage collection.
