# 03. The second call inherits the first call’s seals

**Track:** Harborline Python · **Focus:** function binding, keyword-only arguments and mutable defaults

## The next incident

Allocation is correct, so a helper now prepares manifests. During a night shift, a fresh shipment mysteriously inherits seals from an earlier call. The bug is object ownership across function calls, not routing.

**Connection:** Continue after Allocate stock in arrival order.

## First make the small version

Implement `prototype`: format a shipment ID and seal count as "<id>:<count>".

## Why the script has to change

A mutable default list is created once when a function is defined. Returning the caller’s seal list also lets later caller mutations rewrite an already-prepared manifest. Default binding and copying are separate problems.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/tutorial/controlflow.html#more-on-defining-functions).

## Your production task

Implement make_manifest(shipment_id,seals=None,*,priority="normal"). Return {"id":shipment_id,"seals":a_new_list,"priority":priority}. The ID must be nonempty; priority is normal or urgent; invalid values raise ValueError. Copy supplied seals and create a fresh empty list when omitted. priority must remain keyword-only.

The right signature expresses part of the contract before the function executes. Copying fixes ownership; it does not validate contents or deep-copy arbitrary nested structures.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** Reject a malformed radio record before it changes stock.
