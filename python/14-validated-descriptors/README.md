# 14. Reuse field validation without sharing field values

**Track:** Harborline Python · **Focus:** descriptors, __set_name__ and instance storage

## The next incident

Shipment identity is stable. Several mutable equipment models now repeat the same positive-capacity validation. A reusable descriptor can centralize the rule, but storing the value on the descriptor itself would share it across every container.

**Connection:** Continue after The same shipment appears twice in a set.

## First make the small version

Implement `prototype`: return whether a value is an exact nonnegative int, excluding bool.

## Why the script has to change

Descriptors live on classes. If descriptor.value holds the latest reading, updating one container overwrites every other container’s reading. Validation must also happen before replacing a previously valid value.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/howto/descriptor.html).

## Your production task

Complete NonNegative.__set_name__, __get__ and __set__. A class-level read returns the descriptor itself; instance reads/writes use a private per-instance key derived from the bound attribute name. Missing reads raise AttributeError. Reject negative values and non-exact ints with ValueError, preserving old values. Container has capacity and used descriptors and initializes both from its constructor.

This descriptor validates independent scalar fields; it does not enforce used<=capacity. Cross-field invariants belong in an object-level operation, and adding that unstated rule would change this contract.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** Two dispatchers reserve the last crate.
