# Dataclasses and type hints

## Records without repetitive methods

Many classes mainly store a few related values. The `dataclasses` module can generate common methods such as initialization, representation, and equality from annotated fields. This saves boilerplate while keeping the fields visible in the source. A dataclass remains a normal Python class and can also have custom methods.

Type hints describe expected types for readers and optional checking tools. They do not generally enforce types at runtime. An annotation such as `price: float` does not convert a supplied string to a float. Validation, parsing, and type checking solve related but distinct problems: annotations describe the intended interface, while executable checks enforce a runtime rule where needed.

## Worked example

```python
from dataclasses import dataclass, field

@dataclass
class Reading:
    source: str
    values: list[float] = field(default_factory=list)

left = Reading("sensor-a")
right = Reading("sensor-b")
left.values.append(2.5)
print(left.values, right.values)
```

The output is `[2.5] []`. `default_factory=list` calls `list()` for each new instance, giving each reading separate storage. The annotation documents the expected element type; it does not inspect later calls to `.append()`. Generated equality compares field values for instances of the same dataclass type. The generated representation names the class and fields, making debugging easier.

## Mutability and defaults

`frozen=True` blocks ordinary field assignment, but freezing is shallow. A mutable field can still change and can prevent the generated hash from working:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Snapshot:
    labels: list[str]

snapshot = Snapshot(["stable"])
snapshot.labels.append("changed")
print(snapshot.labels)
try:
    hash(snapshot)
except TypeError:
    print("list field is unhashable")
```

The output is `['stable', 'changed']` followed by `list field is unhashable`. No field was rebound: the referenced list changed internally. A frozen dataclass with equality normally receives a generated hash, but calculating it still requires hashable field values. Prefer tuples of immutable values when stable value semantics are required. `unsafe_hash=True` does not make mutable identity safe; it only requests a method whose correctness remains the author's responsibility.

Use `field(default_factory=...)` for per-instance mutable defaults, and put non-default fields before defaulted fields in an ordinary generated initializer. A factory controls new-instance defaults, not copies: replacing a record with `dataclasses.replace` normally reuses unchanged field objects. Use `__post_init__` for a documented construction rule, remembering that later mutations of a mutable field can bypass that initial check. See [frozen dataclass semantics](https://docs.python.org/3.12/library/dataclasses.html#frozen-instances).

## Practical uses and tradeoffs

Dataclasses suit configuration records, parsed rows, and named results with a stable schema. A dictionary supports dynamic keys; a dataclass exposes known fields to readers and tools. Generated equality requires the same dataclass type, so two unrelated records with identical fields are not automatically equal. A normal class may be clearer when construction and state transitions dominate the record shape.

Type hints such as `str | None`, `list[int]`, and `Callable` express absence, element types, and callbacks for static tools. The generated initializer does not parse external input or enforce those annotations. Decide whether runtime validation belongs in the parser, constructor, or public API, and avoid assuming that an annotated object must have passed it. A type checker can catch some invalid calls before execution; tests and boundary validation still check behavior and values.

Further reading: [Dataclasses reference](https://docs.python.org/3.12/library/dataclasses.html); [Typing reference](https://docs.python.org/3.12/library/typing.html).

## Practice

Represent a task and its labels using dataclasses and type hints. Do not add runtime type validation.

**Prototype:** define `Point` as a frozen dataclass with `x: int` and `y: int`, both required. Its generated equality compares coordinates; normal reassignment to a coordinate must fail.

**Final:** define mutable dataclass `Task` with `title: str` (required), `done: bool = False`, and `tags: list[str]` with a fresh empty list for each instance. Implement `completed_titles(tasks: list[Task]) -> list[str]` to return titles for tasks whose `done` attribute is true, preserving order and duplicates. Do not modify tasks or their tags. Example: `[Task("read", True), Task("write")] -> ["read"]`. Empty input returns `[]`. Generated dataclass methods, field defaults, and the stated annotations are part of this exercise.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
