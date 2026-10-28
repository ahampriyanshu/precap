# Closures and decorators

## Functions can carry context

Python functions are objects: you can store them, pass them to another function, and return them. A nested function can refer to names from an enclosing function. When that nested function survives the outer call, the retained bindings form a closure. Closures are useful for configuring a small operation without introducing a class.

A closure captures bindings rather than a frozen copy of every value. This explains the common loop problem where several callbacks all see the loop's final value. Use a function factory or a deliberate default argument when each callback needs a separate value. To rebind a name belonging to an enclosing function, declare it `nonlocal`; reading or mutating an already referenced object does not require that declaration.

## Worked example

A closure retains a binding, so callbacks created in a loop can all read the same final value. A default argument captures the current value at each definition instead:

```python
late = [lambda: index for index in range(3)]
captured = [lambda index=index: index for index in range(3)]
print([callback() for callback in late])
print([callback() for callback in captured])
```

The outputs are `[2, 2, 2]` and `[0, 1, 2]`. The first group shares the comprehension's `index` binding; it is not a copy made per iteration. In the second group, each default was evaluated when that lambda was created. This captures an object reference, not a deep snapshot: a captured mutable dictionary can still change. A named factory is often easier to read when binding behavior needs more than a short expression.

## A decorator wraps behavior

A decorator receives a function and returns its replacement. `@decorate` is shorthand for binding the function name to `decorate(function)` after its definition. A wrapper should preserve results and exception behavior unless the interface explicitly changes them. `functools.wraps` supplies metadata and `__wrapped__` for inspection; it does not enforce runtime argument or return contracts.

```python
from functools import wraps

events = []
def traced(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        events.append("enter")
        try:
            return function(*args, **kwargs)
        finally:
            events.append("exit")
    return wrapper

@traced
def quotient(left, right):
    return left / right

print(quotient(8, 2), quotient.__name__)
print(events)
```

The outputs are `4.0 quotient` and `['enter', 'exit']`. The result is returned unchanged. The `finally` block also records exit if division raises; the exception continues to the caller. This example's list is a simple observation channel, not a thread-safe metrics system. A real observer must avoid raising an unrelated error during cleanup and masking the function's original failure.

## State, errors, and tradeoffs

Decorators run during function definition, so configuration captured then may differ from configuration read on each call. Stacking decorators composes replacements from the inside out, making order observable for authorization, retries, and metrics. A retry wrapper can repeat side effects; caching can return the same mutable result to many callers. Both require stronger contracts than a transparent trace wrapper.

A synchronous wrapper around `async def` observes coroutine creation rather than execution unless it awaits the coroutine in an asynchronous wrapper. Wrapping a generator similarly requires a decision about creation versus iteration. Choose the execution boundary deliberately instead of applying one wrapper shape universally.

Closure state lives while its returned function is reachable and requires synchronization if concurrent calls mutate it. A class can make ownership clearer when several operations share many state variables. A closure works well for one operation with a little configuration. Use `nonlocal` to rebind an enclosing binding; mutating an object already referenced there does not require it.

Further reading: [`functools.wraps`](https://docs.python.org/3/library/functools.html#functools.wraps).

## Practice

Create a configurable calculation and a transparent counting wrapper.

**Prototype:** `make_multiplier(factor)` returns a callable accepting one number and returning that number times `factor`. Separate calls retain independent factors.

**Final:** `count_calls(function)` returns a wrapper that accepts positional and keyword arguments, returns the original result, and propagates original exceptions. Expose integer attribute `wrapper.calls`, initially 0. Increment it before every invocation, including calls that raise. Preserve the wrapped function's `__name__`, `__doc__`, and `__wrapped__` using `functools.wraps`. Each wrapper has its own counter. Example: after wrapping `abs`, calls with `-2` and `-3` return `2` and `3`, and `.calls` is 2. Thread safety is outside this exercise.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
