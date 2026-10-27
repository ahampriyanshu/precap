# 06. A dictionary typo reaches the loading bay

**Track:** Harborline Python · **Focus:** annotations, dataclasses and runtime invariants

## The next incident

Atomic files protect complete manifests. As several scripts exchange shipment dictionaries, one writes "quanity" and another silently defaults to zero. Harborline needs an explicit record shape and validation at construction.

**Connection:** Continue after A crash must not erase the previous manifest.

## First make the small version

Implement `prototype`: return a tuple (identifier,quantity) for valid inputs without validation.

## Why the script has to change

Type annotations alone do not reject bad runtime values. A frozen record prevents field reassignment, but freezing is not deep immutability for nested objects. Here the fields are scalar, so a frozen dataclass is an appropriate boundary.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/library/dataclasses.html).

## Your production task

Complete Shipment(id:str,quantity:int) as a frozen dataclass. Reject an empty ID and quantities that are not positive exact ints (bool excluded) with ValueError. Implement parse_shipments(rows) -> list[Shipment], requiring each mapping to have exactly id and quantity keys. Preserve order; reject unknown/missing fields. No partial result escapes on failure.

The supplied dataclass decorator defines the record’s mechanics; your constructor validation defines the domain. Equality and hashing should follow immutable field values.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** Make invalid inventory states unreachable.
