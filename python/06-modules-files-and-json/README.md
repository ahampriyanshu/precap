# Modules, files, and JSON

## Modules provide boundaries

A module is a Python file that can define functions, classes, and constants. `import json` makes a module available under a name; `from pathlib import Path` imports one named object. Splitting code into modules keeps related behavior together and allows reuse. Importing normally executes a module's top-level statements once per interpreter session, so avoid starting interactive prompts or writing files merely because a module was imported.

## Files and structured text

JSON maps objects to dictionaries, arrays to lists, and null to `None`. Its object keys are strings, so encoding an integer-keyed dictionary changes the key types on round trip. Tuples become arrays rather than remaining tuples. Parsing validates JSON syntax, not an application schema: a successfully parsed document can still contain an unexpected top-level value, field type, or range.

## Worked example

Python's JSON encoder accepts non-finite floats by default, even though those tokens are outside standard JSON. Reject them at an interchange boundary:

```python
import json

payload = {"latency_ms": float("nan")}
print(json.dumps(payload))
try:
    json.dumps(payload, allow_nan=False)
except ValueError:
    print("non-finite measurement rejected")
print(json.loads('{"enabled": false}')["enabled"])
```

The outputs are `{"latency_ms": NaN}`, `non-finite measurement rejected`, and `False`. Serialization success under the defaults does not guarantee another language's parser accepts the output. `allow_nan=False` is an encoder policy; enforcing a strict decoder policy needs separate handling, including `parse_constant`. Schema validation remains another step. See the documented [JSON interoperability limits](https://docs.python.org/3.12/library/json.html#standard-compliance-and-interoperability).

## Practical choices and mistakes

A text file is an encoding boundary. Specify `encoding="utf-8"` rather than relying on the machine's locale. A `with` block closes its handle when control leaves the block, including on decoding or parsing errors. Missing files, invalid permissions, malformed text, and invalid application data are distinct failures; the owner of the operation should choose which can be recovered.

Opening a destination in mode `"w"` truncates it before serialization finishes. For an update where readers must see either the old complete document or the new complete document, stage the entire serialization and then replace the destination:

```python
import json
from pathlib import Path
from tempfile import TemporaryDirectory

with TemporaryDirectory() as directory:
    destination = Path(directory) / "settings.json"
    destination.write_text('{"version": 1}', encoding="utf-8")
    encoded = json.dumps({"version": 2}, allow_nan=False)
    staged = destination.with_suffix(".tmp")
    staged.write_text(encoded, encoding="utf-8")
    staged.replace(destination)
    print(json.loads(destination.read_text(encoding="utf-8"))["version"])
```

The output is `2`, and the temporary directory is removed afterward. Serializing first prevents an unsupported value from truncating the destination. A same-directory replacement avoids exposing a partially written destination when the filesystem supports atomic rename. This demonstration uses a private directory and one writer. Concurrent writers need uniquely named staging files and conflict policy; crash durability requires additional filesystem-specific work such as synchronization. Atomic visibility alone does not provide a transaction across several files.

Read a small configuration whole when that keeps ownership simple. Limit input size at external boundaries; huge JSON can consume substantial memory even when syntactically valid. Do not use `eval` to parse data. A database is a better boundary when updates require queries, concurrency control, or transactions. Avoid silently replacing every configuration error with defaults, since that can mask a deployment defect.

The guard `if __name__ == "__main__":` identifies code that should run only when the file is executed as the entry point. Put command-line behavior under that guard while leaving reusable functions importable. Name your modules carefully: a local `json.py` can shadow the standard library module and cause confusing imports.

## Practice

Read and write a small JSON list of names. `path` is a string or `pathlib.Path`. Names are strings.

**Prototype:** `decode_names(text)` parses JSON text and returns the result if it is a list containing only strings. Raise `ValueError` for malformed JSON or the wrong shape. Empty lists are valid.

**Final:** `load_names(path)` reads UTF-8 text and applies the same rules. `save_names(path, names)` writes the provided list as UTF-8 JSON and returns `None`. Preserve name order and Unicode, and do not mutate the list. An existing file is replaced. Exact whitespace and escaping in the JSON are not specified. Missing files raise `FileNotFoundError`; wrong-shape or malformed content raises `ValueError`. The parent directory exists; no directory creation or atomic replacement is required. Example content `["Ada", "李"]` loads as the same two names.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
