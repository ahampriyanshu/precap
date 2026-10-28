# Primitive data types

## What a type tells you

A value's type determines its available operations and what information those operations preserve. Python's built-in scalar values include `int`, `float`, `complex`, `bool`, `str`, and `None`. They are objects; “primitive” is a teaching category, not a separate storage model. A variable is a name bound to an object, and rebinding it does not change the object's type.

## Why conversion is explicit

Environment variables, form fields, and CSV cells usually arrive as text. `int("12")` produces a number; `"12" + "3"` concatenates text. `int("3.5")` raises `ValueError`, whereas `int(3.5)` truncates toward zero. Choosing a conversion is therefore choosing a policy, not just changing notation. Validate the accepted range after parsing, and decide whether whitespace, signs, and special floating values such as infinity belong in the input contract.

## Worked example

Precision becomes visible when a numeric identifier crosses a floating-point boundary:

```python
identifier = 2 ** 53 + 1
transported = float(identifier)
print(int(transported) == identifier)
print(identifier - int(transported))
print(-7 // 3, int(-7 / 3))
```

The outputs are `False`, `1`, and `-3 -2`. The integer was exact before conversion; the float rounded it to a nearby representable value. Converting back cannot recover the lost bit. Keep large identifiers as integers or strings through serialization and storage. A formatted number may look plausible even when its underlying value has changed, so display formatting is not a precision check.

Integers grow as needed, subject to memory, so integer arithmetic does not silently wrap at a fixed machine width. Binary floats have finite precision: a large integer may lose information when converted to `float`. Complex numbers combine real and imaginary components. Strings are immutable Unicode sequences, not encoded bytes; encoding is an explicit boundary. `None` represents absence and should remain distinguishable from valid values such as zero or an empty string.

Arithmetic can also convert implicitly. `/` produces a float even for two integer operands, while `//` uses floor division. For negative numbers, flooring differs from truncating toward zero: `-7 // 3` is `-3`. `divmod` keeps a quotient and remainder consistent with that rule.

## Common mistakes and choices

Use approximate comparisons for measured quantities, with tolerances chosen for the problem. For amounts whose contract uses decimal rounding, construct decimal values from text and state the rounding rule:

```python
from decimal import Decimal, ROUND_HALF_UP

unit_price = Decimal("1.005")
cent = Decimal("0.01")
per_item = unit_price.quantize(cent, rounding=ROUND_HALF_UP) * 3
on_total = (unit_price * 3).quantize(cent, rounding=ROUND_HALF_UP)
print(per_item, on_total)
```

The output is `3.03 3.02`. Rounding each item and rounding the total implement different policies; neither choice follows merely from selecting `Decimal`. Constructing from a float preserves that float's approximation. Decimal arithmetic also has a precision context, so it does not remove every rounding decision. See the [decimal model](https://docs.python.org/3.12/library/decimal.html).

`bool("False")` is `True` because nonempty text is truthy. Parse textual flags explicitly. Booleans also participate in integer arithmetic, so an API accepting counts must decide whether `True` is valid input. Use `is None` for absence and `==` for value comparisons. String methods return new strings; they do not mutate their receiver.

## Using the supplied function shells

The supplied `def` lines establish the exercise interface. Replace each indented `raise NotImplementedError` with a body that returns the required result. Printing demonstrates a value but does not return it to a caller. Preserve parameter names and defaults because callers may use keyword arguments. A result such as `(3, 4)` is a tuple containing two ordered values. The tests exercise the public contract, including boundary values, rather than requiring a particular local variable or implementation.

## Practice

Build a few small text-to-value helpers. Inputs have the types described below; no additional type validation is required.

**Prototype:** implement `minutes_to_seconds(minutes)`. Given a nonnegative integer, return the integer number of seconds. Examples: `2 -> 120`, `0 -> 0`.

**Final API:**

- `split_seconds(total_seconds)` accepts a nonnegative integer and returns `(minutes, remaining_seconds)` with the remainder from 0 through 59. `125 -> (2, 5)`.
- `greeting(name, unread)` accepts a string and a nonnegative integer. Strip surrounding whitespace from the name and return `"NAME: N unread"`, preserving the name's case. `(" Ada ", 2) -> "Ada: 2 unread"`. An empty stripped name is allowed.
- `parse_enabled(text)` strips surrounding whitespace and ignores case. Return `True` for `"true"`, `False` for `"false"`, and `None` for any other string, including empty text.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
