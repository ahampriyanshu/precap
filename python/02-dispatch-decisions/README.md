# 02. Allocate stock in arrival order

**Track:** Harborline Python · **Focus:** branches, loops, dictionaries, copies and comprehensions

## The next incident

Quotes work. The loading desk now receives requests in arrival order, and stock is limited. Each accepted request must reduce a private working inventory; a failed request must leave it untouched.

**Connection:** Continue after The first shipping quote.

## First make the small version

Implement `prototype`: return the sum of requested quantities; requests are (sku,quantity) pairs.

## Why the script has to change

Summing requests cannot decide which requests can be served. Copying only the variable name aliases the caller’s dictionary. Reordering requests to simplify a comprehension changes who gets the last crate.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/tutorial/datastructures.html).

## Your production task

Implement allocate(requests,stock) -> (accepted_skus,remaining_stock). Serve each request fully if enough stock remains, otherwise skip it. Missing SKU means zero. Require positive integer request quantities and nonnegative integer stock; bool is not an integer quantity for this contract. Validate the entire input before allocation. Never mutate either input.

Use ordinary control flow for stateful decisions. A compact comprehension is not an improvement when it obscures mutation and ordering.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** The second call inherits the first call’s seals.
