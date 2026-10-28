# Classes and objects

## What a class adds

A class defines a kind of object with state and behavior. An instance is one object created from that class. Attributes store its state; methods operate on that state. Functions and dictionaries are enough for many tasks, but a class becomes useful when several operations must share the same evolving state and preserve the same rules.

Calling a class normally constructs an instance and runs its `__init__` method. That method initializes attributes; it must return `None`. The first parameter of an instance method is conventionally named `self`. Python supplies the instance automatically in a call such as `counter.add(3)`, so the method can access `self.value`. Different instances normally hold different instance attributes.

## Worked example

Objects are useful when operations preserve a state invariant. This allocator must never reserve more capacity than remains available:

```python
class Capacity:
    def __init__(self, available):
        if available < 0:
            raise ValueError("negative capacity")
        self.available = available

    def reserve(self, amount):
        if not 0 <= amount <= self.available:
            raise ValueError("reservation exceeds capacity")
        self.available -= amount

pool = Capacity(5)
pool.reserve(3)
try:
    pool.reserve(4)
except ValueError:
    print(pool.available)
```

The output is `2`. Validation happens before mutation, so a rejected transition preserves the previous valid state. The constructor establishes the initial nonnegative invariant. This small class assumes numeric inputs and single-threaded use; its check and update would need one synchronization boundary if shared by workers. An invariant is meaningful only when every public mutation path preserves it.

## Designing useful objects

A class should own one coherent responsibility and make valid transitions easy. A connection owns a resource; a parser may own parsing state; an immutable transformation may need only a function. Establish instance attributes during construction so partially initialized objects do not escape. A method call binds the receiver as `self`; storing shared state on the class instead can silently broaden ownership.

Class attributes are shared until an instance shadows them. Mutating an inherited container does not create an instance-specific copy:

```python
class SharedHooks:
    hooks = []

first = SharedHooks()
second = SharedHooks()
first.hooks.append("audit")
print(second.hooks)
first.hooks = []
print(first.hooks, second.hooks)
```

The outputs are `['audit']` and `[] ['audit']`. Appending changed the shared class list; assignment then installed a separate attribute on `first`. Create mutable per-instance storage in `__init__`. Class-level registries can be intentional, but require explicit ownership, cleanup, and synchronization rules rather than relying on how attribute lookup happens to work.

## Common mistakes and tradeoffs

A leading underscore signals internal state; it does not prevent access. In the capacity example, assigning `pool.available` directly bypasses the rule. A read-only property or a smaller public interface can steer callers through validated methods, but Python conventions still matter. Document which attributes callers may set and which belong to the implementation.

Returning a mutable internal list also creates a bypass. Return a snapshot when that is the promised behavior, remembering that a shallow snapshot still shares nested values. A live view can be useful, but its lifetime and mutation rules must be explicit. Tests should observe state transitions and failure behavior rather than requiring particular private names. Classes add value when they centralize rules; collecting unrelated functions behind one object adds coupling without establishing ownership.

## Practice

Build a text notebook with independent state for each instance. Inputs are strings; empty strings and duplicates are valid.

**Prototype:** implement `Note(text)` with a public `text` attribute and `preview(limit)`. For a nonnegative integer limit, return the first `limit` characters of the text. `Note("hello").preview(3) -> "hel"`.

**Final:** implement `Notebook()` with methods `add(text)`, `all_notes()`, and `find(term)`. `add` appends a string and returns `None`. `all_notes` returns a fresh list of every note. `find` returns a fresh list of notes containing the case-sensitive substring `term`, preserving insertion order and duplicates. An empty term matches every note. Modifying a returned list must not affect the notebook. Separate notebooks must not share storage. No file persistence is needed.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
