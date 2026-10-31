# Memory and garbage collection

## Names refer to objects

Assignment creates a binding from a name to an object; it does not copy the object. Containers, instance attributes, closures, caches, and stack frames can also hold references. An object remains reachable while a program can follow strong references to it. Understanding those paths is the first step in explaining memory growth.

## Reference counting and cycles

CPython combines reference counting with a cyclic collector; other implementations can make different lifetime choices. Reference counting can reclaim an object when no strong references remain, but a group of objects referring to one another may have positive counts after outside owners disappear. The cyclic collector can discover that such a group is unreachable. Do not depend on a precise destruction schedule.

## Worked example

```python
import gc
import weakref

class Document:
    pass

item = Document()
item.link = item
observer = weakref.ref(item)
retained = [item]
del item
print(observer() is retained[0])
retained.clear()
gc.collect()
print(observer() is None)
```

The first output is `True`: deleting the name left the list's strong reference intact. `item.link = item` also created a self-cycle. Clearing the list removes the final outside reference, leaving an unreachable object that still refers to itself. In the CPython-based runtime used here, the final output is `True` after requesting cyclic collection. The weak observer does not keep the document alive. This controlled observation is not a portable promise about when arbitrary destructors run.

## Weak references and explicit ownership

A weak reference observes an object without keeping it alive. Retrieve its referent once and hold that local strong reference while using it: checking one call and dereferencing a second can race with loss of the last strong owner. Not every type supports weak references; ordinary user-defined instances generally do, while ordinary lists and dictionaries do not directly.

A weak-value cache is an index of objects owned elsewhere, not a retention policy. In this controlled example, a strong list owner keeps the object available:

```python
import gc
import weakref

class Artifact:
    pass

artifact = Artifact()
cache = weakref.WeakValueDictionary({"latest": artifact})
owners = [artifact]
del artifact
print("latest" in cache)
owners.clear()
gc.collect()
print("latest" in cache)
```

The outputs are `True` and `False` in CPython. Removing the final strong owner permits collection, and the weak dictionary entry disappears. This is appropriate when a miss can recreate or reload the value. Use a bounded strong cache with explicit eviction if retention is required. Weak references to values do not remove unrelated strong references held by callbacks or cache keys.

`del name` removes one binding. It does not mean “force this object to free its memory.” Another name, a list entry, or a cache may still refer to the same object. Even after an object becomes unreachable, the language does not promise immediate destruction or a drop in operating-system memory usage. Python's allocator can retain memory for reuse.

Use context managers or explicit `close` for files, locks, and connections. A finalizer is not a dependable substitute for a defined resource lifetime.

## Diagnosing growth

A self-referential list is a cycle, but a cycle is not automatically a leak. A reachable cache retaining more objects forever is a retention problem even when each object could be collected after eviction. Collection cannot remove data the program still strongly owns. Distinguish “unreachable,” “reclaimed by Python,” and “memory returned to the operating system”; those are separate events.

Look for retained paths before forcing collection: unbounded dictionaries, callback registries, suspended generators, closures, and stored exception tracebacks can all keep large graphs alive. A bounded container may still retain large payloads, so measure both entry count and size. `gc.collect` is a diagnostic request, not a repair for reachable state or a command to shrink process memory.

Where supported, start `tracemalloc` before the operation, take snapshots around repeatable work, and compare with `after.compare_to(before, "lineno")`. Warm up imports and caches before measuring steady-state behavior. Allocation traces identify Python allocations rather than all native-library or operating-system memory, and shallow `sys.getsizeof` does not recursively total a graph. Exact byte counts vary by runtime. Some browser builds omit allocation tracing; the weak-reference examples do not require it.


## Practice

Build a cache that does not own the objects it indexes. Cached values are weak-referenceable user-defined objects.

**Prototype:** `observe(obj)` returns a `weakref.ref` for that exact object. Calling the returned reference yields the live object, or `None` after it has been collected. The observer must not keep an extra strong reference.

**Final:** implement `WeakCache()` using `weakref.WeakValueDictionary`. `put(key, obj)` stores or replaces the weakly held object and returns `None`; keys are strings. `get(key)` returns the live object or `None` when missing/collected. `discard(key)` removes an entry if present, returns `None`, and is harmless when absent. `len(cache)` reports the currently live entries. Store no extra strong reference to a cached value. Different caches are independent. Tests retain strong references when checking live values and explicitly call `gc.collect()` when checking controlled unreachable cycles. Do not add destructors, tune collection thresholds, assert collection counts, or require exact allocation sizes. Both stages run in native Python and Pyodide.

Run `python main.py --stage prototype` first, then `python main.py --stage final`.
The default stage is `final`. Edit `exercise.py`; leave the tests in `main.py` unchanged.
