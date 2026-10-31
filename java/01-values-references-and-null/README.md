# Values, references, and null

## What a variable contains

Java primitives (`int`, `long`, `double`, `boolean`, `char`, and the smaller numeric types) hold values. Reference variables hold a reference to an object, or `null`; assigning a reference copies that reference, not the object. Method arguments are always passed by value, including the value of a reference. Reassigning a parameter cannot rebind the caller's variable, while mutating a referenced list changes the shared object.

```java
var left = new ArrayList<>(List.of("a"));
var right = left;
right.add("b");
assert left.size() == 2;
right = new ArrayList<>();
assert left.size() == 2;
```

`==` compares primitive values and reference identity. Use `.equals` for logical object equality; `Objects.equals` handles nullable references. Autoboxing creates wrapper references such as Long, and unboxing a null wrapper throws NullPointerException. Wrapper caching makes identity checks appear to work for some numbers and fail for others, so never use it as numeric equality.

## Arithmetic is a contract

An `int` expression is evaluated as int before assignment to long. Widen an operand before multiplying; widening a wrapped result cannot recover it. Integer division truncates toward zero. Overflow normally wraps silently; use Math.addExact/multiplyExact when overflow is an error. Floating-point arithmetic approximates real numbers; decimal money generally needs integer units or BigDecimal with an explicit rounding policy.

```java
int width = 70_000;
long area = (long) width * width;
assert area == 4_900_000_000L;
```

Null is absence only when the API says so. Empty text, zero, and absence are different states. Validate at the boundary and keep the distinction in the return type; a Long can carry null while a long cannot. Local variables require definite assignment, but fields/array cells receive default zero/null values. `final` prevents reassignment; it does not freeze a referenced object.

## Practice

**Prototype:** implement `parseCount(String text) -> Long`. Null or strip()-empty input returns null. Otherwise parse a signed decimal long after strip(); accept a leading + and require the result >=0. Negative, malformed, or out-of-range values raise IllegalArgumentException (NumberFormatException is acceptable).

**Final:** implement `summarize(List<String> inputs) -> Summary(int present,int missing,long total)`, applying that parsing contract once per entry. Missing values increase missing, zero increases present. Do not mutate the input. Reject any invalid entry and reject total overflow with ArithmeticException using exact addition. Empty input returns Summary(0,0,0).

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
