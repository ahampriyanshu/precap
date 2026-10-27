# 05. A crash must not erase the previous manifest

**Track:** Harborline Python · **Focus:** modules, JSON, filesystem I/O and exception-safe replacement

## The next incident

Radio records are validated. Harborline now persists the accepted manifest. Opening the live file for writing truncates the old valid manifest before serialization or writing has succeeded.

**Connection:** Continue after Reject a malformed radio record before it changes stock.

## First make the small version

Implement `prototype`: serialize an in-memory JSON-compatible object to a string using sorted keys.

## Why the script has to change

A serialization error after truncation destroys the last known good state. Writing a temporary file on another filesystem can make rename non-atomic. Atomic visibility also differs from power-loss durability; this lesson promises the former, not a full storage transaction.

This is a fictional engineering scenario, not a fabricated account of Python’s invention. The language mechanism and its documented guarantees are the real foundation. [Official Python reference](https://docs.python.org/3.13/library/os.html#os.replace).

## Your production task

Implement save_manifest(path,data). Serialize with ensure_ascii=False, sort_keys=True and allow_nan=False. Write UTF-8 to a unique temporary file in the destination directory, close it, then os.replace it onto path. Existing parent directory is required. On any pre-replacement failure leave the old file intact and remove your temporary file. Propagate the original exception.

The standard-library imports form boundaries you can replace in tests. Do not catch every exception and pretend the save succeeded. fsync and directory durability are deliberately outside this contract.

`exercise.py` supplies imports, signatures and public data shapes. Complete its methods/functions without changing the contract or tests. Imports alone must not start threads, processes, I/O or an event loop. Any helper shown in the scaffold is part of the task unless its behavior is explicitly supplied.

## Work and verify

```bash
python3 main.py --stage prototype
python3 main.py --stage final
```

The standard-library tests live in `main.py`. They exercise values and observable side effects, including failure paths; concurrency chapters use synchronization and bounded safety waits instead of asserting machine speed. Stubs intentionally fail. No solution is included in the learner directory.

Before coding, explain which behavior the small version fails to guarantee. After coding, explain the ownership/lifetime of each mutable resource and which exceptions the caller sees. For concurrency, also identify the unit of atomicity and the shutdown/cancellation contract.

**Next handoff:** A dictionary typo reaches the loading bay.
