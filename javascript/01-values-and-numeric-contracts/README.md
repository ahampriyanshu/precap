# Values and numeric contracts

JavaScript was designed to make programs easy to embed in web documents. Its dynamic values and automatic conversions made small scripts convenient, but the same conversions can obscure a service's data contract. Experienced engineers need to distinguish what the language permits from what an operation should accept.

## Values have types; bindings can change

The primitive types are undefined, null, boolean, number, bigint, string, and symbol. Objects include arrays and functions. A binding created with `const` cannot be reassigned; the object it references may still change. Use `let` for a binding whose value changes and avoid function-scoped `var` in new code unless its different scope is intentional.

```javascript
const settings = { retries: 2 };
settings.retries = 3;             // the object is mutable
console.log(typeof null);         // "object": a historical exception
console.log(settings.missing);    // undefined
```

`null` is often an explicit absence in an API; undefined often means no value was supplied. Decide how those meanings cross JSON, because JSON omits undefined object properties and cannot encode BigInt directly. A symbol is useful for an identity that should not collide with a string property, but symbol keys also need an explicit serialization policy.

## Conversion is a policy decision

`+` can concatenate strings, while subtraction performs numeric conversion. Loose equality applies additional coercions. A boundary validator should accept the intended representation rather than assume a successful conversion proves valid input.

```javascript
console.log("12" + 1);            // "121"
console.log(Number(""));          // 0
console.log(parseInt("12ms", 10));// 12: prefix parsing, not strict validation
console.log(0 === false);         // false
```

A configuration field containing an empty string may mean missing, not zero. Similarly, a parser accepting `12ms` may be useful for a documented unit format but wrong for an integer count. Separate trimming, grammar validation, range checking, and defaulting. `value || fallback` also treats zero, false, and an empty string as absent; `value ?? fallback` only defaults for null or undefined.

## Choose a numeric representation deliberately

Number is floating point. Integers are exact only within the safe-integer range. NaN and infinities are valid Number values, so `typeof value === "number"` is insufficient for quantities, timestamps, or limits. Decimal fractions such as 0.1 do not generally have exact binary representations.

```javascript
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
console.log(10n ** 30n + 1n);          // exact integer arithmetic
```

Use integer minor units for bounded money arithmetic and define rounding separately. BigInt handles arbitrary-size integers, with arithmetic cost that grows with magnitude. BigInt and Number cannot be freely mixed; converting a large BigInt to Number can discard information. JSON protocols commonly carry large identifiers as strings so clients do not lose digits before application code sees them.

## Review the boundary, not just the happy path

For an operation accepting a count, decide how it handles a negative number, fractional number, NaN, infinity, boolean, numeric string, empty string, and overflow after arithmetic. Validate a derived result as well as the input when multiplication can leave the safe range. Keep rejection separate from a legitimate zero result. Those decisions prevent silent corruption in pagination, billing, capacity limits, and identifiers.

## Practice

Prototype: implement `secondsFromMinutes(minutes)`. Accept a nonnegative safe-integer Number and return minutes × 60 as a safe-integer Number. Throw RangeError for every other value or an overflowing result.

Final: implement `parseCount(text)` and `addExact(left, right)`. parseCount accepts a string, trims it, and accepts only one or more ASCII digits whose numeric value is a nonnegative safe integer. Return null for invalid text/range; throw TypeError for a non-string input. Leading zeros are permitted. addExact accepts two nonnegative BigInts and returns their exact sum; wrong types throw TypeError, negative inputs throw RangeError.

Complete the exported stubs in `exercise.mjs`. The prototype and final stages have separate checks.

```bash
node main.mjs --stage prototype
node main.mjs --stage final
```

Use Node.js 20+ locally, or the website's browser worker. Tests are standard-library only and check the documented behavior; they do not prove performance or force garbage collection.
