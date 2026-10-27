# 01. The first shipping quote

**Track:** Harborline Python · **Focus:** values, types, Decimal and rounding

## The next incident

Ishan turns Mira’s paper tariff into Harborline’s first Python script. A price that is “almost right” is still wrong when thousands of invoices are reconciled. The script must distinguish numeric meaning from how text happens to be formatted.

**Connection:** Start here: no previous chapter is required.

## First make the small version

Implement `prototype`: return weight * rate for nonnegative integer inputs; this small version has no rounding problem.

## Why the script has to change

Binary floating point does not exactly represent most decimal fractions. Rounding a weight before multiplying also changes the invoice. Values such as NaN and Infinity are not valid prices merely because a parser accepts them.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/library/decimal.html).

## Your production task

Implement quote(weight_text,rate_text) -> Decimal. Parse decimal strings, require finite nonnegative values, multiply exactly, then quantize once to cents using ROUND_HALF_UP. Reject invalid input with ValueError. prototype(weight,rate) returns the integer product.

Keep Decimal values through the calculation, and return a numeric object rather than formatting too early. The test deliberately checks scale as well as equality.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** Allocate stock in arrival order.
