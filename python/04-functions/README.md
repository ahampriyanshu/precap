# Functions

## Why functions exist

A function gives a name to a repeatable operation. It accepts inputs through parameters and sends a result back with `return`. Callers can use the operation without repeating its implementation. This reduces duplication, but the larger benefit is a clear boundary: a reader can reason about a small calculation independently from the rest of a program.

## Signatures and defaults

Positional arguments are matched by position; keyword arguments name the parameter explicitly. A default makes an argument optional. A `*` in a signature can make later parameters keyword-only, which helps readers distinguish options with similar types. Keep a signature small and name parameters after their role rather than their data type.

## Worked example

A signature can expose options and ownership together. Here a call returns a new header mapping and accepts its override only by keyword:

```python
def request_headers(base, *, request_id):
    result = dict(base)
    result["X-Request-ID"] = request_id
    return result

defaults = {"Accept": "application/json"}
headers = request_headers(defaults, request_id="r-17")
print(headers["X-Request-ID"])
print("X-Request-ID" in defaults)
```

The output is `r-17` and `False`. Assigning the local `result` does not change the caller's binding, and copying the dictionary avoids changing its entries. This is a shallow copy; if values were mutable objects, they would still be shared. The keyword-only `request_id` makes the override's role visible at the call site. Copying is a contract choice with a cost proportional to the number of entries, not a universal requirement for every function.

## Scope and practical uses

Local names normally belong to one call. A function can read names in its enclosing scopes and module, but assignment normally creates a local binding. Prefer passing dependencies as arguments over changing global variables. Functions are also values: they can be stored in a list, returned, or passed to another function as a callback. This is how sorting keys and many data-processing APIs accept custom behavior.

`def` creates a function object and binds its name. Its body runs when called, not when defined. Parameters are local names bound to the supplied argument objects. Reassigning a parameter does not reassign the caller's variable, but mutating a passed list changes that shared object. A function with no executed `return` statement returns `None`. Printing a value is not the same as returning it; a printed message is for a person, while a return value can be used in another calculation.

## Common mistakes and tradeoffs

Default expressions run when a definition executes, not on each call. Mutable defaults can therefore become hidden shared state. The following intentionally broken helper makes that lifetime observable:

```python
def tagged(label, tags=[]):
    tags.append(label)
    return tags

first = tagged("alpha")
second = tagged("beta")
print(first is second)
print(first)
```

The output is `True` and `['alpha', 'beta']`. The first result changes during the second call because both names refer to the default list. For independent storage, default to `None` and create a list inside the call. If `None` itself is meaningful, use a dedicated sentinel to distinguish omission. An immutable default such as a tuple avoids mutation but still needs an explicit conversion if the body requires a mutable container.

Document input mutation, output ownership, exceptional conditions, and whether a callback may be invoked more than once. A parameter annotation alone establishes none of those rules. Avoid global accumulators merely to avoid returning a result. Extract a function when it gives a meaningful rule a name or isolates a dependency; excessive fragmentation can hide a simple sequence across many calls. Dependencies passed as parameters are easier to substitute and reason about than dependencies read from changing module state.

## Practice

Build reusable numeric transformations. Values and factors are integers or floats; tests use exactly representable results.

**Prototype:** `scale(value, factor=2)` returns `value * factor`. Accept the factor either positionally or by keyword.

**Final:** `transform_values(values, operation, *, keep=None)` returns a new list. For each input, call `keep(value)` first if a predicate was supplied. Skip values for which it is false. Apply `operation(value)` exactly once to every retained value and preserve order. With no predicate, retain every value. Example: `transform_values([1, 2, 3], lambda n: n * 10, keep=lambda n: n > 1) -> [20, 30]`. Empty input returns `[]`. Do not mutate the input. Let callback exceptions propagate. `keep` must be passed by keyword.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
