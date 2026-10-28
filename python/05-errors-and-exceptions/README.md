# Errors and exceptions

## Errors are information

An exception reports that an operation could not produce its normal result. Examples include converting `"hello"` with `int`, looking up a missing dictionary key, and opening a missing file. A traceback shows the calls leading to the failure and identifies the exception type and message. Read the final line for the immediate problem, then follow the relevant call frames to understand how the program reached it.

A `try` block marks operations whose failures you intend to handle. An `except ValueError` block handles that specific category. Other exceptions continue outward to the caller. This separation allows a low-level parser to report invalid input while a user interface chooses how to display the problem. A function should not silently replace every failure with a plausible result.

## Worked example

```python
def read_percentage(text):
    number = int(text)
    if not 0 <= number <= 100:
        raise ValueError("percentage must be between 0 and 100")
    return number

try:
    read_percentage("120")
except ValueError as error:
    print(error)
```

The printed message is `percentage must be between 0 and 100`. Conversion succeeds, then the range check rejects a value that is numerically valid but unsuitable for this operation. A different input such as `"many"` fails at conversion. Both failures use the same exception category because the caller supplied an unacceptable value.

## Handling and cleanup

Catch where a caller can make a decision: reject an item, request another value, or stop the operation. Keep the protected region narrow so unrelated bugs do not get mistaken for expected input failures. `else` runs when the `try` body completes normally. `finally` runs while leaving the construct, including through an exception or return; context managers express most resource ownership more clearly.

When changing abstraction levels, retain the original cause rather than replacing the traceback with a generic message:

```python
class InvalidConfiguration(Exception):
    pass

def read_port(settings):
    try:
        return int(settings["port"])
    except (KeyError, ValueError) as error:
        raise InvalidConfiguration("port is missing or invalid") from error

try:
    read_port({"port": "many"})
except InvalidConfiguration as error:
    print(type(error.__cause__).__name__)
```

The output is `ValueError`. The public error describes the configuration boundary while `__cause__` keeps the conversion failure available for diagnostics. A wrong runtime type such as a list still raises `TypeError` here: the handler deliberately catches only the categories it translates. If such types are expected external input, extend the documented validation boundary rather than blindly catching every exception. This helper validates representation, not the usable port range.

## Common mistakes and tradeoffs

A bare `except:` catches `BaseException` subclasses such as `KeyboardInterrupt`. Routine recovery should usually catch specific `Exception` subclasses and let termination requests propagate. Returning zero from a broad handler can turn a defect into plausible data. Preserve partial failure information when a batch continues after rejecting an item, and define whether any earlier side effects remain committed.

Avoid `return` in a `finally` block: it can replace a pending result or suppress an exception. Cleanup can itself fail; decide whether to preserve the original failure and how to report the cleanup problem. `raise` without an argument re-raises the active exception. Custom exceptions are useful when callers need a stable category across several implementation failures, not merely a new class for each message. Tests should usually assert the promised error category and state after failure; pin the exact wording only when messages are part of the interface.

## Practice

Parse whole-number counts without hiding rejected input. Arguments are strings.

**Prototype:** `parse_count(text)` uses Python's `int(text)` conversion. Return the converted integer when it is nonnegative; raise `ValueError` for negative or unparseable text. Whitespace and a leading `+` are allowed by `int`. No exact error message is required.

**Final:** `parse_counts(lines)` processes a list of strings and returns `(accepted, rejected)`. `accepted` contains parsed nonnegative integers in order. `rejected` contains zero-based indices of strings rejected by `parse_count`. Example: `["2", "bad", "-1", " 0 "] -> ([2, 0], [1, 2])`. Continue after a `ValueError`; do not catch unrelated exceptions. Do not modify the input. Empty input gives `([], [])`.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
