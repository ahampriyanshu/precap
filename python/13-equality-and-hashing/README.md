# Equality and hashing

## Identity and equality ask different questions

`is` asks whether two references identify the same object. `==` asks whether the objects should count as equal values. Two separately created lists can be equal while having different identities. Use `is None` because `None` is a unique absence marker; use equality for ordinary numbers, text, and value records. Do not depend on implementation-specific reuse of small integers or strings.

A custom class normally inherits identity-based equality unless it defines another rule. Implementing `__eq__` lets a record compare selected attributes. When the other operand's type is unsupported, return `NotImplemented`, allowing Python to try the other operand's comparison and fallbacks. This is a special return value, distinct from raising `NotImplementedError` in an unfinished method.

## Hashing supports fast lookup

A dictionary or set uses a hash to locate candidate entries and equality to distinguish matching values. Equal objects must have equal hashes. Unequal objects may share a hash; collisions are expected and handled. A hash must stay stable while the object is used as a key. This is why mutable lists are unhashable and why a value object with mutable identity fields is dangerous as a key.

## Worked example

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Coordinate:
    row: int
    column: int

seen = {Coordinate(2, 3), Coordinate(2, 3), Coordinate(3, 2)}
print(len(seen))
```

The result is `2`. The two records with coordinates `(2, 3)` are separate objects but equal values, so the set keeps one equal entry. Their generated hashes obey the equality rule. The frozen integer fields give the record stable value behavior under normal attribute assignment.

## Choosing an equality rule

Equality should model the fields that define the public value. If a field is normalized, hashing must use the same normalized representation. Normalizing once during construction is usually easier to keep consistent than repeating different transformations in `__eq__` and `__hash__`.

Returning `NotImplemented` is part of comparison dispatch, not a false result and not an exception. It lets the other operand participate:

```python
class Opaque:
    def __eq__(self, other):
        return NotImplemented

class AcceptsOpaque:
    def __eq__(self, other):
        return isinstance(other, Opaque)

left = Opaque()
right = AcceptsOpaque()
print(left == right, right == left)
print(left == object())
```

The outputs are `True True` and `False`. The first comparison falls back to the right operand's equality method. When both sides decline equality, ordinary `==` falls back to identity. Defining `__eq__` without a suitable `__hash__` makes a class unhashable by default; that is safer than retaining an incompatible identity hash. The demonstration classes are therefore not value keys. `NotImplementedError` instead signals an operation that has not been implemented and must not be returned as a comparison result.

## Practical uses and mistakes

Value keys suit coordinates, composite lookups, deduplication, and cache entries. An immutable tuple may be sufficient; a named class adds a place for normalization and a clearer schema. A mutable entity may instead use identity semantics or a stable immutable identifier. Changing fields involved in a key's hash after insertion can make the existing entry unreachable by ordinary lookup even though the object is still stored.

Do not use a Python hash as a persistent identifier or cryptographic digest. Some built-in hashes vary between processes; equal hash integers also do not prove value equality. Test dictionary lookup and equality consistency rather than a specific numeric hash. Include an unsupported comparison type and equal separately constructed keys in tests. Equality with side effects or surprising cross-type behavior can break the expectations on which collection lookup relies.

Further reading: [Comparison dispatch](https://docs.python.org/3.12/reference/datamodel.html#object.__eq__) and [hash contracts](https://docs.python.org/3.12/reference/datamodel.html#object.__hash__).

## Practice

Create stable, case-insensitive lookup keys. Inputs are strings; no email syntax validation is required.

**Prototype:** `same_label(left, right)` strips surrounding whitespace and uses `str.casefold()` on both strings, then returns whether the normalized strings are equal.

**Final:** implement immutable `UserKey(name, domain)`. Normalize both fields with `.strip().casefold()` at construction and expose normalized public `name` and `domain`. Keys compare by those two fields only, are hashable, and work interchangeably as dictionary keys. Normal attribute reassignment must fail. Empty fields are valid. Equality with an unrelated type must be false; `key.__eq__(unrelated)` should return `NotImplemented`. Example: `UserKey(" Ada ", "EXAMPLE.COM") == UserKey("ada", "example.com")`. You may use a frozen dataclass; do not test or hardcode specific numeric hash values.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
