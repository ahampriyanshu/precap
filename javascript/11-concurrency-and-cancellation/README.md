# Bounded concurrency and cancellation

Starting every promise at once can exhaust sockets, memory, rate limits, or a database connection pool. Concurrency limits arose to control in-flight work rather than merely queue unlimited requests somewhere else. Cancellation adds another contract: which work stops starting, which work can cooperate, and what happens to work already committed elsewhere.

## Parallel waiting still consumes resources

An asynchronous request can retain a response body, a pool slot, buffers, and a deadline while waiting. A batch of ten thousand operations is therefore not free because its CPU usage is low. Bound active operations and avoid creating an unbounded list of pending tasks upstream of that bound.

```javascript
const limit = 4;
const items = Array.from({length: 100}, (_, index) => index);
console.log(Math.min(limit, items.length)); // worker slots, not 100 active calls
```

A fixed number of worker loops can claim the next index, await its operation, and repeat. Results can be stored by input index even when completion order differs. The useful metric is completed work within its deadline, alongside rejection, queue age, and dependency saturation.

## AbortSignal communicates intent

AbortController exposes a signal and records a reason when aborted. A signal can be passed across cooperating APIs, but it does not forcibly interrupt arbitrary JavaScript or undo a remote effect. Check a pre-aborted signal before dispatch so an already canceled operation does not begin.

```javascript
const controller = new AbortController();
controller.abort(new Error("Caller no longer needs this result"));
console.log(controller.signal.aborted); // true
```

A network API may stop local I/O when signaled while the server continues processing a request it already received. Keep stable operation identities for consequential retries. For CPU-bound synchronous code, a signal check can work only when that code returns to a point where cancellation is observed; terminating a dedicated worker provides a different, harder local stop boundary.

## Failure requires a dispatch and drain policy

When one item fails, decide whether to continue independent items or stop starting new ones. If started operations must release resources before the batch rejects, wait for them to settle. Failing fast at the outer promise while losing ownership of other work can leave background side effects and unhandled rejections.

The first observed failure is a useful stable rejection reason. Later failures still need to be observed so they do not escape as unhandled rejections. Cooperative cancellation can shorten the drain, but a task that ignores its signal may keep running until its own deadline. There is no magic promise combinator that guarantees external cancellation.

## Test concurrency without wall-clock races

Use deferred promises as gates. Count active operations, release them in a chosen order, and verify the maximum active count, next dispatch, output order, and final cleanup. Test both a task that throws before returning and a task that rejects later. These checks are more reliable than asserting that a request finishes within a few milliseconds on a shared machine.

## Practice

Prototype: `runWithSignal(task, signal)` checks an AbortSignal before invoking task(signal), then awaits and returns its result. A pre-aborted signal rejects with its exact reason and never invokes task. In-progress cancellation is cooperative; do not pretend it can roll back an operation.

Final: `mapLimit(items, limit, operation, {signal} = {})` applies operation(item,index,signal) with at most limit active calls and returns results in input order. limit must be a positive safe integer or reject with RangeError. On the first observed failure or abort, start no new items, await all started calls, then reject with that exact failure/reason. Observe later rejections. Empty input returns []; a pre-aborted signal rejects with its exact reason and dispatches nothing. On mid-flight abort, active calls may keep running cooperatively, but the batch must wait for every one to settle before rejecting; do not dispatch pending items after observing abort. Do not mutate items.

Complete the exported stubs in `exercise.mjs`. The prototype and final stages have separate checks.

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Use Node.js 20+ locally, or the website's browser worker. Tests are standard-library only and check the documented behavior; they do not prove performance or force garbage collection.
