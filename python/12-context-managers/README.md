# Context managers

## A lifetime with clear boundaries

Some operations acquire something that must later be released: an open file, a lock, or a temporary configuration change. A context manager gives that lifetime a clear shape with `with`. It runs setup before the block and cleanup when the block exits. This makes the cleanup rule visible near the code using the resource.

Cleanup must also happen when the body raises an exception or returns early. Relying on garbage collection for closing a file or unlocking a resource makes behavior depend on implementation details and retained references. A context manager ties cleanup to control flow instead.

## Worked example

Cleanup belongs on both the success and failure paths. A generator context manager can make that rule local to acquisition:

```python
from contextlib import contextmanager

@contextmanager
def marked(events):
    events.append("enter")
    try:
        yield "ready"
    finally:
        events.append("exit")

events = []
try:
    with marked(events) as status:
        events.append(status)
        raise ValueError("body failed")
except ValueError:
    events.append("caught")
print(events)
```

The output is `['enter', 'ready', 'exit', 'caught']`. The value yielded becomes `status`; the body exception is raised back at the suspended yield. The `finally` block runs before control reaches the outside handler, and it does not suppress the failure. If setup raises before the yield, there is no successfully entered context; release anything already acquired within setup's own failure handling.

## Two implementation styles

A class-based context manager implements `__enter__` and `__exit__`. `__enter__` returns the value bound by `as`. `__exit__` receives exception information and can suppress the exception by returning a truthy value. Usually a cleanup manager should return `None` or `False` so failures remain visible.

The `@contextmanager` decorator is convenient when setup and cleanup fit naturally around one `yield`. The generator must yield exactly once. Put cleanup in `finally`, and avoid accidentally swallowing an exception caught around the yield. A manager object created by this decorator is generally intended for one use; call its factory again for another block.

## Practical uses and mistakes

Use existing managers for files and locks. `ExitStack` is useful when the number of owned resources depends on runtime data; it also closes earlier acquisitions when later work fails:

```python
from contextlib import ExitStack
from io import StringIO

handles = []
try:
    with ExitStack() as resources:
        for text in ["12", "bad"]:
            handles.append(resources.enter_context(StringIO(text)))
        numbers = [int(handle.read()) for handle in handles]
except ValueError:
    print("parse failed")
print([handle.closed for handle in handles])
```

The outputs are `parse failed` and `[True, True]`. Both handles close although constructing the result fails. Exit callbacks run in reverse registration order. Resource cleanup does not roll back arbitrary side effects or erase partially updated application state; transaction behavior requires its own contract.

Acquisition order is also a dependency decision. If closing one resource needs another still open, register the dependency first so it closes last. Do not return a handle from inside this stack and expect it to remain usable afterward. Transferring ownership requires an explicit arrangement that removes or transfers the pending cleanup.

For temporary configuration, distinguish a missing value from one explicitly set to `None`. Nested managers should restore the state each observed, so inner cleanup returns to the outer temporary state. Changing a global configuration value can affect unrelated threads even when restoration is correct; passing explicit configuration is often safer.

`with` arranges cleanup on ordinary control-flow exits. It cannot guarantee successful I/O cleanup or recovery after abrupt process termination. If `__enter__` fails, Python does not call that manager's `__exit__`; acquisition code must handle partial setup. If cleanup raises, it can replace the visible failure while retaining exception context. State that policy explicitly when cleanup can fail.

Further reading: [`ExitStack` and context managers](https://docs.python.org/3.12/library/contextlib.html#contextlib.ExitStack).

## Practice

Temporarily change one entry in a supplied dictionary. Do not change unrelated entries.

**Prototype:** `temporary_value(mapping, key, value)` is a context-manager factory. Assume the key already exists. Set it to the supplied value during the block; yield the same mapping; restore the old value afterward, including after an exception. Do not suppress the body's exception.

**Final:** `temporary_setting(mapping, key, value)` has the same behavior but also handles an initially absent key: remove it on exit. Restore the original state of the selected key even if the body assigns or deletes that key. Preserve unrelated changes made by the body. Nested uses must restore in last-in, first-out order. Example: with `settings={"mode": "light"}`, a temporary `"dark"` value becomes `"light"` again afterward. A missing key originally remains missing afterward. No thread safety is required.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
