# Inheritance and composition

## Two ways to reuse behavior

Inheritance defines a class in terms of another class. A subclass can reuse inherited methods and override selected behavior. Composition gives an object references to other objects and delegates work to them. Both reduce duplication, but they express different relationships: inheritance promises a compatible kind of object, while composition assembles collaborators.

A useful subclass should satisfy the expectations of callers using the base class. If a base method accepts a sequence and returns text, a subclass should not unexpectedly require a filename or return a number. This substitutability matters more than sharing a few lines of implementation. A deep inheritance tree can hide where behavior comes from, so keep hierarchies small.

## Worked example

Composition lets a caller vary policy without multiplying subclasses. Here formatting is a collaborator rather than an inherited stateful service:

```python
class UpperFormatter:
    def format(self, text):
        return text.upper()

class Display:
    def __init__(self, formatter):
        self.formatter = formatter

    def show(self, text):
        return "[" + self.formatter.format(text) + "]"

print(Display(UpperFormatter()).show("hello"))
```

The output is `[HELLO]`. `Display` requires the collaborator's behavior, not a particular ancestry. A second formatter can be injected without changing its implementation. For one stateless operation, accepting a function may be even simpler. If a collaborator owns a connection or cache, composition must also state who closes or clears it; holding a reference does not establish a lifecycle policy automatically.

## Calling inherited behavior

`super()` follows the instance's method resolution order, not simply the textual parent class. Cooperative overrides can extend a common operation while allowing every participant to run:

```python
class Base:
    def trace(self):
        return ["base"]

class Left(Base):
    def trace(self):
        return ["left"] + super().trace()

class Right(Base):
    def trace(self):
        return ["right"] + super().trace()

class Combined(Left, Right):
    pass

print(Combined().trace())
```

The output is `['left', 'right', 'base']`. Inside `Left.trace`, `super()` reaches `Right` for this receiver, although `Right` is not named in `Left`'s bases. Calling `Base.trace` directly would skip that cooperative step. Real cooperative hierarchies need compatible signatures and an agreed terminal implementation; merely sprinkling `super()` into unrelated classes does not supply that contract. For initialization, also arrange that every required participant receives and forwards the appropriate arguments.

## Practical uses and tradeoffs

Inheritance fits framework extension points with a stable base contract. An override must preserve accepted inputs, result meaning, exceptions, and state expectations. Requiring stronger preconditions in a subclass can break a caller that was correct for the base. Composition fits replaceable storage, formatting, and authorization policies and often makes their dependencies easier to test independently.

Code reuse alone is weak evidence for a subtype relationship. Prefer a small hierarchy whose shared assumptions can be described, and composition when collaborators evolve on different schedules. Multiple inheritance can express cooperative mixins, but resolution order becomes part of the design. Test behavior through the common caller, not only through direct subclass calls.

## Common mistakes

Avoid exact-class branches before every common operation; they make adding an implementation require editing callers. Conversely, do not assume any matching method name guarantees matching semantics. Document mutation and resource ownership as part of the common interface. Shared class-level mutable state can couple otherwise separate subclasses. A stack that forbids arbitrary insertion is not automatically a compatible list subtype just because a list can store its elements.


## Practice

Make small, interchangeable text operations. Inputs are strings.

**Prototype:** implement `Lowercase.apply(text)`, returning lowercase text. Construction takes no arguments.

**Final:** implement `TextOperation.apply(text)` as a base method that raises `NotImplementedError`; `Strip(TextOperation)` and `Replace(TextOperation)` override it. `Strip()` removes surrounding whitespace. `Replace(old, new)` stores two strings and replaces every occurrence using normal `str.replace` behavior (including its behavior for an empty `old`). Implement `Pipeline(operations).apply(text)` to apply operations in order, returning the final string. Copy the provided operations sequence at construction so later appends to it have no effect. An empty pipeline returns its input unchanged. Accept any object with `apply(text)`, including `Lowercase`; do not require inheritance. Callback exceptions propagate.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
