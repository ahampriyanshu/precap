# Errors and resource lifetimes

Errors carry a failure across call boundaries so each layer can handle the part it owns. Resource cleanup must follow every exit: successful return, exception, cancellation, and partial initialization. JavaScript's garbage collector reclaims unreachable memory; it does not provide a timely close protocol for files, sockets, locks, or subscriptions.

## Throw meaningful failures at the right boundary

Throw Error objects rather than strings so callers get a stack and a recognizable type. Use TypeError for an incompatible value kind, RangeError for an unsupported numeric/domain range when appropriate, and a domain-specific class when callers need a stable business distinction. Preserve the cause when wrapping a lower-level failure.

```javascript
try {
  JSON.parse("broken");
} catch (cause) {
  const failure = new Error("Settings could not be decoded", {cause});
  console.log(failure.cause instanceof SyntaxError); // true
}
```

Do not catch an error merely to return undefined unless that is the documented result. Distinguish a missing record, a rejected operation, and an unavailable dependency. A retryable transport failure also does not establish that a remote mutation did not happen.

## Finally follows control flow

A finally block runs when execution exits its try block. Returning or throwing from finally can replace an earlier result or exception, which is rarely the intended error policy. Put cleanup there, but decide what happens if cleanup itself fails.

```javascript
const events = [];
try { events.push("work"); }
finally { events.push("close"); }
console.log(events); // ["work", "close"]
```

Acquisition can fail before a resource exists, so cleanup should apply only to successfully acquired resources. If a wrapper owns the resource, close it exactly once. If ownership remains with the caller, closing it inside a helper may be a bug. Establish that contract before choosing a convenient syntax.

## Await the lifetime you claim to manage

A try/finally around a returned promise can close the resource before that promise finishes unless the relevant work is awaited within the lifetime. The same issue occurs when starting detached work from inside a request scope.

```javascript
async function inspect(open) {
  const resource = await open();
  try { return await resource.read(); }
  finally { await resource.close(); }
}
```

This integration fragment assumes read and close methods with asynchronous contracts. It demonstrates ordering, not a complete policy for simultaneous body and close failure. Disposal syntax may be available in particular runtimes, but explicit try/finally remains useful for understanding the ownership mechanism.

## Preserve evidence when cleanup also fails

If both the main operation and cleanup fail, blindly throwing the cleanup error hides the original failure. AggregateError can retain both in a defined order. If only one fails, preserve that exact error object so callers can correlate its type, cause, and identity.

Cancellation is a request to stop useful work, not automatic resource cleanup in every API. Pass an AbortSignal to operations that support it, then wait for their cleanup according to the application's deadline. Releasing local resources cannot roll back a remote effect that already committed. Test failure interleavings with controlled promises instead of hoping a sleep happens to expose the race.

## Practice

Prototype: `withResource(resource, body)` calls body(resource), then resource.close() exactly once before returning or throwing. This stage is synchronous. If body succeeds, return its value; if either part fails, propagate it. If both fail, throw AggregateError containing the exact original thrown values `[bodyError, closeError]` in that order, without replacing either object.

Final: `usingResource(open, body)` asynchronously acquires the resource by awaiting open(), awaits body(resource), and awaits resource.close() exactly once. Apply the same result/error policy. If acquisition fails, never invoke body or close. Do not resolve or reject before cleanup completes, including when body has already failed.

Complete the exported stubs in `exercise.mjs`. The prototype and final stages have separate checks.

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Use Node.js 20+ locally, or the website's browser worker. Tests are standard-library only and check the documented behavior; they do not prove performance or force garbage collection.
