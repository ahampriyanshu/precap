# Properties and descriptors

## Attributes can have behavior

A normal attribute stores a value directly on an instance. A property lets attribute access call methods while retaining familiar syntax such as `object.temperature`. This is useful for a calculated value, a read-only view, or a validation rule that must run on every assignment. A property should remain reasonably cheap and unsurprising; an explicit method is clearer for a slow network call or a major state transition.

Properties let a class evolve its implementation without forcing callers to replace every attribute read with a getter call. The public name stays the same while storage moves to an internal attribute. An underscore is a convention for that internal storage, not an access-control mechanism.

## Worked example

```python
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    @property
    def area(self):
        return self.width * self.height

shape = Rectangle(3, 4)
print(shape.area)
shape.width = 5
print(shape.area)
```

The outputs are `12` and `20`. `area` is computed from the current dimensions each time it is accessed. There is no separate stored area to become stale when a dimension changes. With no setter, assigning `shape.area = 9` raises `AttributeError`.

## Validated assignment

A setter should validate before replacing valid state. This example also uses the public setter during construction, keeping initial and subsequent assignments on the same path:

```python
class RetryLimit:
    def __init__(self, value):
        self.value = value

    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, proposed):
        if type(proposed) is not int or proposed < 0:
            raise ValueError("expected a nonnegative integer")
        self._value = proposed

limit = RetryLimit(3)
try:
    limit.value = -1
except ValueError:
    print(limit.value)
```

The output is `3`; the rejected assignment leaves the old value intact. Exact `int` checking deliberately excludes booleans and subclasses here. Other interfaces may accept a wider numeric protocol, so state the choice rather than copying a check blindly. Reading `self.value` from its own getter would recurse; the distinct storage name avoids that. The setter protects ordinary public assignment, not deliberate writes to `_value`, and it does not synchronize a multi-field transition.

Assignment syntax does not imply an infallible update. Callers must handle the property's documented exception categories just as they would for a method.

## Descriptors generalize properties

A descriptor is stored on a class and customizes access with `__get__`, `__set__`, or `__delete__`. Properties are data descriptors: they take precedence over ordinary entries in an instance dictionary, including a property with no setter. Functions are non-data descriptors, which is how ordinary method access binds `self`; an instance attribute can shadow a non-data descriptor.

A reusable validator can learn its attribute name through `__set_name__` and store each instance's value under a private key. Storing the latest value directly on the descriptor would accidentally share it across all instances. A descriptor's `__get__` must also decide what class-level access such as `Owner.field` means, where the instance argument is `None`. Implementing these rules earns its complexity when several fields need the same behavior.

## Choices and mistakes

Prefer a property for one computed or validated field and a custom descriptor for a repeated access rule. A computed property avoids a stale duplicate value, as the rectangle's area shows, but it still has a computational cost on every read. Cache only when dependencies and invalidation rules are explicit.

Do not hide slow network operations, surprising mutations, or major state transitions behind attribute reads. Type hints do not execute setter validation, and a read-only property does not freeze other attributes or nested objects. Test both accepted updates and preservation of state after rejection. When several fields must change atomically, a method describing that transition is usually clearer than coordinating independent setters.


## Practice

Expose calculated and validated attributes.

**Prototype:** implement `Circle(radius)` with a public mutable `radius` and a read-only `diameter` property returning `2 * radius`. The radius is a nonnegative number; no validation is required in this stage.

**Final:** implement `Temperature(celsius)` with a read-write `celsius` property and read-only `fahrenheit` property computed as `celsius * 9 / 5 + 32`. Celsius values are finite integers or floats. Reject values below -273.15 with `ValueError`, both during construction and later assignment. A rejected assignment preserves the prior value. No type or NaN validation is required. Different instances are independent. Example: `Temperature(0).fahrenheit -> 32.0`. Use a property setter for the rule; a custom descriptor is optional extension material, not required.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
