# Stacks and nested operations — Java

## Problem and baseline

Validate nested LOAD/UNLOAD operations with a left-to-right failure rule. Balanced label counts do not establish that unloads close the most recent outstanding load.

Aggregate counts lose nesting. Adjacent-pair reduction can model cancellation but must not inspect malformed tokens after an earlier ordering violation. A stack directly stores the unresolved obligations in reverse arrival order.

## A focused Java step

ArrayDeque exposes stack operations without allowing null elements. The top is the most recently loaded label:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        Deque<String> pending = new ArrayDeque<>();
        pending.push("a");
        pending.push("b");
        assert pending.peek().equals("b");
        assert !pending.peek().equals("a");
        assert pending.size() == 2;
    }
}
```

An UNLOAD:a at this point is an ordering failure even though a is present deeper in the stack. The public method must stop there rather than parse a later token. That precedence is observable behavior, not merely an optimization.

## Where the idea is useful

Stack obligations appear in parsing, bracket matching, scoped resource operations, and undo histories. Choose a stack when the most recent unresolved operation must be handled first.

## Mechanism

A stack models obligations in reverse arrival order. Counts cannot prove nesting: LOAD:a LOAD:b UNLOAD:a UNLOAD:b has balanced counts and invalid order. Parse a token only when processing reaches it; an earlier ordering violation must return false before a later malformed token is examined. Final O(n) time, O(depth) space.

## Java representation

Tokens must be exactly `LOAD:label` or `UNLOAD:label` with a nonempty label containing no colon. Reached malformed tokens raise `IllegalArgumentException`. Return false immediately on the first LIFO violation; otherwise require an empty stack at end. Empty input returns true.

Inputs satisfy the documented Java types and contain no null elements unless the API explicitly permits null. Arithmetic uses signed 64-bit `long`; inputs and their mathematical results must fit that range. Indices and sizes use `int`. Preserve caller-owned arrays, lists, records, and nested rows, including on validation failure. Use `IllegalArgumentException` for documented invalid values.

## Practice

**Prototype:** implement `prototype(List<String> tokens)` returning `boolean` with a direct baseline.

**Final:** implement `solve(List<String> tokens)` with the mechanism and bounds described above. Tokens must be exactly `LOAD:label` or `UNLOAD:label` with a nonempty label containing no colon. Reached malformed tokens raise `IllegalArgumentException`. Return false immediately on the first LIFO violation; otherwise require an empty stack at end. Empty input returns true. Both stages have the same observable contract. The prototype may use the simpler method; final must use the target data structure.

All methods are static members of `Exercise`.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
