# Packages, builds, and tests

## Compilation and execution are different boundaries

A source file declaring a public class has that class's filename. A package contributes to its fully qualified name; directory layout conventionally mirrors the package. `javac -d out` writes class files under package directories, and `java -cp out package.Main` loads that named class. Classpath roots are directories/jars, not package directories. Java 9+ modules add explicit dependency/export boundaries; ordinary classpath code remains useful for small exercises.

```java
package sample;
public class Tool {
    public static String name() { return "tool"; }
}
```

Compile that source into an output root and import sample.Tool from consumers. Imports resolve names; they do not install dependencies. Maven/Gradle coordinate dependency resolution, reproducible builds, test execution, and packaging. Pin versions and compiler release, and distinguish the JDK used to run a build from the bytecode/API level it targets. This course uses the standard library and Java 17, with default-package Exercise/Main so each download compiles independently.

## Test the public contract

A compiler error is a source/API failure, not an algorithm test failure. A process that runs zero tests must not report success. Java `assert` statements are disabled unless enabled with -ea; this course's harness explicitly throws AssertionError and exits nonzero. Named checks should isolate behavior, compare values, and exercise invalid input without corrupting subsequent state.

Tests should make failure precedence visible. If a parser sees an unknown flag after a valid option, it must reject the request rather than publish partial configuration. Table-driven tests cover boundary values; a handful of clear state transitions often explains more than a large collection of implementation-mirroring checks. Parsing is separated from side effects here, so argument errors cannot accidentally start a server or mutate global settings. A pure options value also makes repeated calls independent.

## Practice

**Prototype:** `parsePort(String value) -> int` accepts only one or more ASCII decimal digits, no signs/whitespace, and requires 1..65535. Invalid input raises IllegalArgumentException.

**Final:** `parseOptions(String[] args) -> Options(int port,boolean verbose)`. Defaults: port 8080, verbose false. Accept --port followed by a parsePort value and/or --verbose in either order. Reject unknown flags, missing port values, repeated --port, repeated --verbose, and invalid ports. Return only after validating the full array, preserve args, and share no configuration state between calls.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
