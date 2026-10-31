# Functions and control flow

Functions separate a reusable operation from the place that chooses when it runs. JavaScript functions are values: they can be passed, returned, stored, and closed over. This supports composition, but also makes evaluation order, receiver binding, and error propagation part of a callback API.

## Iterate according to the required effect

A for loop gives explicit sequencing and early exit. for-of reads an iterable's values. for-in enumerates enumerable property names, including inherited names, and is usually inappropriate for array values. map creates transformed output; forEach is for effects and does not await asynchronous callbacks.

```javascript
const values = [2, 4, 6];
const doubled = values.map(value => value * 2);
console.log(doubled); // [4, 8, 12]
```

A callback's return value matters only if the consumer uses it. Returning from a forEach callback does not return from the outer function or break iteration. Choose a construct whose control flow matches the operation rather than hiding a loop inside the wrong helper.

## Define arguments, defaults, and absence

Missing arguments evaluate to undefined. Default parameters apply to undefined, including an omitted argument; null is a separately supplied value. Rest parameters collect remaining arguments into a real array. Destructuring can make a contract readable but does not validate arbitrary input.

```javascript
function describe({limit = 20} = {}) { return limit; }
console.log(describe(), describe({limit: 0}), describe({limit: null})); // 20, 0, null
```

Avoid defaulting through truthiness when zero and false have meaning. Keep positional arguments for small stable contracts and an options object for independently evolving settings. Validate the boundary once; spreading unknown options deeper can make ownership and rejection behavior obscure.

## Receiver and function identity are observable

An ordinary function's this depends on how it is called. An arrow function captures this lexically. Extracting a method and calling it separately can therefore lose the receiver. bind creates a new function object, which matters when removing event listeners or using a function as a collection key.

```javascript
const counter = {value: 2, read() { return this.value; }};
const read = counter.read.bind(counter);
console.log(read()); // 2
```

Choose arrows for lexical callbacks and ordinary functions when dynamic receivers are intentional. A higher-order utility should document whether it preserves this and whether it invokes its callback once, multiple times, or lazily.

## Side effects change what reordering means

A pure transformation is easier to compose and test because it does not alter caller-owned inputs. A callback that writes a record, increments a counter, or throws has observable order. Parallelizing or retrying it changes semantics even if the returned values look equivalent.

When grouping records, compute each record's key once, preserve the required group and item order, and allocate new result arrays. If a callback fails, stop according to the declared policy. There is no universal “functional” method that makes side effects safe; the API needs an execution contract.

## Practice

Prototype: `sumSelected(values, predicate)` visits each Number once in input order, calls predicate(value, index) once, and sums values for which it returns true. Return 0 for empty input. Stop and propagate a callback exception.

Final: `groupBy(values, keyOf)` calls keyOf(value, index) exactly once per item in input order and returns a Map. Group keys follow first appearance; each new group array preserves item order and the original item references. Do not mutate inputs. Stop on callback failure and do not invoke later items.

Complete the exported stubs in `exercise.mjs`. The prototype and final stages have separate checks.

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Use Node.js 20+ locally, or the website's browser worker. Tests are standard-library only and check the documented behavior; they do not prove performance or force garbage collection.
