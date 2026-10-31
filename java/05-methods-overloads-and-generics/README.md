# Methods, overloads, and generics

## Two kinds of method selection

Overload resolution happens at compile time using declared argument types. Overriding dispatch happens at runtime using the receiver's actual class. A null argument can make unrelated overloads ambiguous, and a return type alone cannot distinguish overloads. Avoid overload sets whose boxing, widening, and varargs choices make call sites surprising. Prefer clear names when semantics differ.

```java
static String describe(Number x) { return "number"; }
static String describe(Integer x) { return "integer"; }
// With Number n = Integer.valueOf(3), describe(n) selects Number.
```

Arguments are passed by value. Lambdas may capture effectively final local variables; they capture references, so the referenced object may still be mutable. A functional interface specifies one abstract operation and supplies a checked type for a lambda.

## Generic types describe relationships

List<Integer> is not a subtype of List<Number>: otherwise a caller could insert a Double into an integer list. `? extends T` is useful when you read values produced by a collection, and `? super T` when you pass T values to a consumer. A mapping function can consume a supertype of T and produce a subtype of R. This is an API relationship, not a request for unchecked casts.

```java
List<? extends Number> numbers = List.of(1, 2);
Number first = numbers.get(0);
// numbers.add(3) does not compile: the exact element type is unknown.
```

Type erasure means most generic parameters are not available as runtime class identities. You cannot construct `new T[]`, and overloads that erase to the same signature clash. Primitive types cannot be generic arguments; wrappers bridge that boundary. Prefer compile-time constraints over Object plus casts. Optional describes an absent return value; it is usually clearer than null when callers are expected to branch, but do not blindly use Optional for fields, method arguments, or every intermediate expression.

## Practice

**Prototype:** implement `<T> Optional<T> first(List<T> values)`. Return empty only for an empty list, otherwise the first element. Null elements are outside the domain; do not mutate input.

**Final:** implement `<T,R> List<R> map(List<? extends T> values, Function<? super T,? extends R> transform)`. Apply transform exactly once per element in encounter order, return a fresh list, preserve input, and propagate a transform's exception unchanged. Results may be null. Empty input invokes no transform. Keep the generic signatures: tests compile a Number consumer against Integer inputs.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
