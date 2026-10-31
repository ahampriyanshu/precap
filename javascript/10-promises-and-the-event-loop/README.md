# Promises and the event loop

JavaScript execution in one ordinary agent runs one job at a time. Asynchronous APIs let it wait without reserving that execution thread for an idle operation. Promises represent eventual outcomes, while async/await provides structured syntax for consuming them. None of these mechanisms makes a long synchronous computation run on another CPU.

## Scheduling explains observable order

Synchronous code runs to completion for its current job. Promise reactions run as microtasks after the current synchronous work reaches a checkpoint. Timer callbacks belong to later tasks; a requested delay is not an exact execution time.

```javascript
const events = [];
events.push("sync");
Promise.resolve().then(() => events.push("microtask"));
await Promise.resolve();
console.log(events); // ["sync", "microtask"]
```

An endlessly replenished microtask queue can delay timers and rendering. Yielding through an already resolved promise does not necessarily create the opportunity a browser needs to paint. Move substantial CPU work to a worker, reduce it, or schedule bounded tasks through a deliberate platform API.

## An async function returns a promise

A returned value fulfills that promise; a thrown error rejects it. Await suspends the async function's continuation, not the whole thread. The operation you await must itself provide an asynchronous contract; calling a blocking function first still blocks.

```javascript
async function load(fetchProfile, fetchBalance) {
  const profile = await fetchProfile();
  const balance = await fetchBalance(profile.accountId);
  return {profile, balance};
}
```

This integration fragment contains a real dependency: balance needs the account ID. Starting unrelated operations together can reduce a waterfall, but parallelizing dependent or side-effecting operations without a protocol changes correctness.

## Choose a batch's failure semantics

Promise.all preserves input result order and rejects when one input rejects, but it does not cancel the remaining operations. Promise.allSettled reports every outcome. Promise.any returns the first fulfillment and fails only when all inputs reject. Promise.race selects the first settlement, which also does not cancel losing work.

A task function differs from an already running promise. An API receiving functions controls when work starts and can bound concurrency; an API receiving promises often receives work that has already started. Handle a task that throws synchronously as well as one that returns a rejected promise.

## Completion must include the work being claimed

forEach ignores the promises returned by an async callback. An outer function can therefore return before its supposed work finishes. Use a sequential loop when ordering matters, or explicitly construct and await the intended batch with a defined failure policy.

Attach rejection handlers to work you own and avoid swallowing failures merely to quiet a console. A timeout promise can stop waiting without stopping the operation. Cancellation requires the next layer to cooperate, and cleanup requires an owner. Tests should control promise resolution order directly so they can distinguish invocation order from completion order.

## Practice

Prototype: `sequence(tasks)` accepts functions that may return values or promises. Invoke and await them one at a time in input order. Return results in that order. Stop at the first failure and propagate the exact error; do not start later tasks.

Final: `allSettledOrdered(tasks)` starts every task without waiting for earlier tasks. Return a promise for input-ordered records `{status:"fulfilled", value}` or `{status:"rejected", reason}`. Treat synchronous throws as rejections and preserve each reason's identity. Empty input returns an empty array. Input arrays remain unchanged.

Complete the exported stubs in `exercise.mjs`. The prototype and final stages have separate checks.

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Use Node.js 20+ locally, or the website's browser worker. Tests are standard-library only and check the documented behavior; they do not prove performance or force garbage collection.
