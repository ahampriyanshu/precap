# 18. CPU work needs a different boundary

**Track:** Harborline Python · **Focus:** multiprocessing spawn, pickling and import safety

## The next incident

Threaded status fetching overlaps waiting. Integrity checks, however, are CPU work. A process pool introduces separate memory and serialization requirements, so replacing a thread pool with a process pool is not a purely cosmetic edit.

**Connection:** Continue after Finish out of order, report in request order.

## First make the small version

Implement `prototype`: calculate one checksum serially: sum((index+1)*byte) modulo 2**32.

## Why the script has to change

Nested functions and lambdas are not generally picklable spawn targets. Import-time process creation recursively starts children when spawn imports the module. Threads sharing state is also no model for process-local state.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/library/multiprocessing.html#contexts-and-start-methods).

## Your production task

Implement checksum(payload:bytes)->int with the specified formula, and checksums(payloads,*,workers)->list[int]. Use ProcessPoolExecutor with multiprocessing.get_context("spawn"), a top-level checksum worker, ordered output and context-managed shutdown. Validate positive exact-int workers even for []. Propagate worker exceptions. No processes start on import; callers execute under their __main__ guard.

The checksum is deliberately small so tests stay fast; no speedup is asserted. The learning objective is correct process boundaries and lifecycle. Real performance depends on computation size versus serialization/startup cost.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** Cancel the shipment group without orphaning work.
