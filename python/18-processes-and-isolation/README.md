# Processes and isolation

## Separate memory changes the design

A process has its own interpreter and memory space. Multiple processes can execute Python work across CPU cores without sharing an ordinary interpreter's GIL. This can help CPU-heavy independent tasks such as parsing large documents or computing transformations. Starting a process and transferring data are expensive relative to a small function call, so parallel execution is worthwhile only when useful work outweighs those costs.

## Importable work and serialization

A process pool transfers function references, arguments, and results using serialization. With the `spawn` start method, a fresh interpreter imports the worker's module. Worker functions should therefore be defined at module scope. Nested functions and lambdas generally cannot be used as portable pool targets. Values passed to and returned from workers must also support the required serialization.

Guard entry-point code with `if __name__ == "__main__":` so importing the main module in a child does not recursively create another pool. Keep the worker module free of surprising import-time side effects.

## Worked example

```python
from concurrent.futures import ProcessPoolExecutor
import multiprocessing

def cube(value):
    return value ** 3

if __name__ == "__main__":
    context = multiprocessing.get_context("spawn")
    with ProcessPoolExecutor(max_workers=2, mp_context=context) as executor:
        print(list(executor.map(cube, [2, 3])))
```

The output is `[8, 27]`. `cube` is importable by the child interpreters, and `map` returns results in input order. Selecting a local context makes the start method explicit without changing the process-wide default. This is a small API demonstration rather than a claim that two cubes benefit from process startup.

Unlike threads, processes do not share an ordinary list or dictionary. Changing a global variable in a worker does not update the parent's copy. Send inputs and retrieve results explicitly, or use specialized shared-memory facilities when the added coordination is justified.

## Resource ownership and failure

An ordinary mutable argument is transferred to process workers rather than becoming a shared Python container. This standalone script demonstrates the observable boundary:

```python
from concurrent.futures import ProcessPoolExecutor
from multiprocessing import get_context

def append_marker(values):
    values.append("child")
    return values

if __name__ == "__main__":
    parent_values = ["parent"]
    with ProcessPoolExecutor(max_workers=1, mp_context=get_context("spawn")) as pool:
        child_values = pool.submit(append_marker, parent_values).result()
    print(parent_values)
    print(child_values)
```

The outputs are `['parent']` and `['parent', 'child']`. The returned list is another transferred value; no mutation is reflected back implicitly. Finish constructing submitted data before handoff and avoid mutating it while serialization may be happening. A process pool's transport is not a synchronous snapshot API at the exact `submit` call.

The context manager joins workers at shutdown. Callable exceptions surface when results are retrieved; an abrupt worker crash can instead break the pool. Open connections and other external resources in their owning process, using a worker initializer when appropriate. File descriptors, locks, and library runtime state are not portable objects merely because a particular start method can inherit some of them.

## Tradeoffs and common mistakes

Run both examples as saved `.py` files with native Python. Spawned workers must be able to import the main module; pasting a definition into an interactive prompt or executing it only in a notebook cell does not provide that module reliably. The main guard prevents recursive pool creation, but does not make a lambda or local function importable.

Measure startup, serialization, result transfer, and peak memory as well as computation time. Batch small tasks when that amortizes transport cost without creating excessive latency or imbalance. Shared memory can reduce copies for large buffers, but introduces explicit lifetime and synchronization obligations. It is not an automatic replacement for ordinary object sharing.

Default start methods vary across operating systems and Python versions, so select a local context when a method is part of the application's assumptions. Return structured results rather than printing from workers, where output can interleave. This lesson requires operating-system processes and cannot run in the browser WebAssembly runtime.


## Practice

Observe which process performs a calculation.

**Prototype:** `square_with_pid(value)` accepts an integer and returns `(value * value, os.getpid())`. Define this function at module scope so spawned workers can import it. Direct calls run in the calling process.

**Final:** `process_squares(values, workers=2)` uses `ProcessPoolExecutor` with `multiprocessing.get_context("spawn")` and the module-level worker above. Return a list of `(square, worker_pid)` pairs in input order. Each worker PID must differ from the calling process's PID; no specific number of distinct workers is promised. Do not modify the input. `workers` is a positive integer; raise `ValueError` below 1, including on empty input. Empty input returns `[]`. Negative integers and duplicates are valid. Join and shut down the pool before returning. Example values `[2, -3]` give squares `4, 9` with child PIDs. No speed assertion is tested.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
