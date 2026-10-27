# 04. Reject a malformed radio record before it changes stock

**Track:** Harborline Python · **Focus:** Unicode text, unpacking, exceptions and precise validation

## The next incident

Manifest helpers stop leaking state. Operators now submit pipe-delimited records, sometimes with full-width characters from a mobile keyboard. Invalid records must fail before reaching inventory.

**Connection:** Continue after The second call inherits the first call’s seals.

## First make the small version

Implement `prototype`: split a three-field string on "|" and return the raw tuple; assume it is well formed.

## Why the script has to change

Blind int() conversion accepts signs and surrounding syntax the radio protocol never allowed. Splitting without a field-count check also accepts missing or extra columns. Normalizing too late can make two identifiers look distinct when the protocol considers them equal.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/library/unicodedata.html).

## Your production task

Implement parse_record(line) -> (identifier,sku,quantity). First NFKC-normalize the full line, split into exactly three pipe-delimited fields, then strip fields. Identifier and sku must be nonempty; quantity must contain only ASCII digits after normalization and represent a positive integer. Preserve identifier/sku case. Raise ValueError for malformed input.

Normalization is a protocol decision, not a universal instruction to erase distinctions. Here the field grammar is deliberately narrower than all numeric strings Python can interpret.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** A crash must not erase the previous manifest.
