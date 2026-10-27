# 09. Change carrier and audit policy independently

**Track:** Harborline Python · **Focus:** composition, structural protocols and dependency injection

## The next incident

Carrier inheritance works. A customer now wants an audit sink, and another wants a different carrier, creating independent choices. A subclass for every carrier/audit combination would multiply classes without adding behavior.

**Connection:** Continue after Add drones without rewriting the dispatcher.

## First make the small version

Implement `prototype`: format an audit line "<shipment_id>:<price>" from already-computed values.

## Why the script has to change

Constructing a real carrier inside the dispatcher makes tests and alternate carriers hard to use. Emitting audit before the carrier succeeds records a dispatch that never happened. Dependencies and the order of side effects are part of the contract.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/library/typing.html#typing.Protocol).

## Your production task

Define a QuoteProvider Protocol with quote(distance,weight), an AuditSink Protocol with record(shipment_id,price), and Dispatcher(carrier,audit). dispatch computes the quote, then records exactly once, then returns the price. Quote failures propagate without audit. Audit failures propagate; do not retry or pretend rollback occurred. Objects need the protocol methods, not inheritance.

Protocols communicate a structural contract to type checkers; they do not automatically validate runtime values. Composition keeps independently varying concerns independent.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** A million records must not become a million objects.
