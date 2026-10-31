# Exceptions and resource lifetimes

## Preserve the cause and the boundary

Checked exceptions are part of a method's declared failure contract. IOException says the operation may fail for environmental reasons; IllegalArgumentException says the caller violated a value contract. Catch where you can recover, translate with context, or perform required cleanup. Catching Exception and returning zero silently turns failure into valid-looking data. Retain the original cause when wrapping; a stack trace without the causal failure loses the mechanism needed to diagnose it.

`finally` runs on ordinary return and exception propagation, but a return/throw inside finally can replace the original outcome. Avoid it. Errors such as OutOfMemoryError generally are not useful application recovery points. Design the narrowest useful throws contract rather than mechanically catching every checked exception.

## Resources have lifetimes beyond reachability

Garbage collection reclaims heap memory; it does not provide timely closure of file handles, sockets, or locks. AutoCloseable makes deterministic cleanup composable with try-with-resources. Resources close in reverse declaration order. If both the body and close fail, the body exception stays primary and the close failure becomes suppressed; inspecting only getCause misses suppressed errors.

```java
try (var reader = new StringReader("text")) {
    assert reader.read() == 't';
}
```

That syntax establishes ownership of the reader's lifetime. An API accepting a caller-owned reader must explicitly say whether it closes it; the type alone cannot answer. Wrapping a reader in BufferedReader and closing the wrapper closes the underlying reader as well. Reading the entire input before parsing can waste memory; a line-by-line reduction keeps workspace bounded by the largest line. Test cleanup during both successful execution and failures, and test what happens when cleanup itself throws. Finalizers and System.gc are not substitutes for a resource protocol.

## Practice

**Prototype:** `parseValue(String text) -> long` strip()-parses a signed decimal long. Blank/malformed/out-of-range text raises IllegalArgumentException with the original NumberFormatException as its cause. Negative numbers are valid. Null outside domain.

**Final:** `total(Reader reader) -> long throws IOException` takes ownership and closes the reader exactly once on success and every failure. Process lines, skip strip()-empty lines, parse the others using parseValue, and sum with Math.addExact (overflow raises ArithmeticException). Empty input totals zero. Propagate IOException. A body error remains primary if close also fails, with close error suppressed. No whole-file materialization.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
