# 08. Add drones without rewriting the dispatcher

**Track:** Harborline Python · **Focus:** abstract classes, inheritance and substitutability

## The next incident

Inventory owns its rules. Dispatch now supports road vans and drones. The current dispatcher contains a growing sequence of type-name branches, and every new carrier risks breaking the old ones.

**Connection:** Continue after Make invalid inventory states unreachable.

## First make the small version

Implement `prototype`: return 100 + 2*distance for a van, assuming a nonnegative integer distance.

## Why the script has to change

Inheritance is not permission for arbitrary behavioral changes. A drone must reject an overweight shipment explicitly, rather than returning a plausible zero quote. The caller should be able to rely on the same method contract for each carrier.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/library/abc.html).

## Your production task

Complete abstract Carrier.quote(distance,weight), RoadCarrier and DroneCarrier. Nonnegative exact-int distance/weight are required. Road quote is 100+2*distance+weight cents. Drone quote is 50+distance+3*weight cents, but weight>5 raises ValueError. Invalid inputs raise ValueError. Implement total_quote(carriers,distance,weight) by invoking the shared interface; no type-name dispatch.

This chapter uses inheritance where there is one stable behavioral interface. The next chapter introduces composition for policies that vary independently, instead of building a class for every combination.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** Change carrier and audit policy independently.
