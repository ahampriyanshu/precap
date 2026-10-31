# Recipe Manager — Java

## Ownership and transitions

A revision is immutable historical content; rollback appends copied historical content as a new revision rather than moving a pointer backwards. A current-name index must release renamed names while retaining old versions. Permissions are explicit, and write does not imply read. Copy nested lists at both ingress and egress. Simple name/ingredient scans cost O(recipes); history copies O(total returned content).

## Java boundaries

Use the supplied nested records as immutable value carriers. A record is only shallowly immutable: copy every retained mutable input and every outward list/map, including lists inside records. Absence is `null`; validation failures use `IllegalArgumentException`, missing-key purchase errors use `NoSuchElementException`, and invalid transaction boundaries use `IllegalStateException`. Java primitive types already exclude booleans from numeric inputs. Numeric values use `long` where signatures say long and all computations must fit signed 64-bit values. Calls in these service exercises are serialized.

Rollback appends a selected historical revision; it does not erase the versions created after that history point:

```java
import java.util.*;

class Example {
    public static void main(String[] args) {
        List<String> history = new ArrayList<>(List.of("v1: A", "v2: B"));
        String selectedContent = history.get(0).substring(4);
        history.add("v3: " + selectedContent);
        assert history.equals(List.of("v1: A", "v2: B", "v3: A"));
    }
}
```

The older content becomes the newest revision while the previous future remains auditable. Name collision checks must consider other recipes current names before appending that selected content.

## Design boundary

Read and write permissions are independent: a writer may create or roll back without being allowed to read. Current-name uniqueness is separate from immutable historical names. Nested ingredient/step lists must be copied on both storage and retrieval so a caller cannot rewrite history through an alias.

## Practice

**Prototype:** RecipeDraft retains copies of name/ingredient/step data; snapshot returns Draft with fresh nested lists. Empty content and duplicate items are valid; no name validation.

**Final:** addUser requires nonempty ID and only read/write permissions; validate before duplicate check, copy permissions. add requires nonempty current unique name and write permission; returns recipe1,recipe2,... only on success. update appends even identical content and returns Integer version; missing/no permission/name conflict returns null. get requires read; null version selects latest, invalid version returns null. history returns detached revisions in order or empty for denied/missing. rollback requires write and appends selected content if its historical name is available; preserve all versions. byIngredient requires read, matches current exact membership once per recipe, sorts ingredient-list size/name/ID. Empty lists/items and duplicates preserve order; empty names raise before permission checks.

The complete public API is in `Exercise.java`. All domain classes are public static nested classes of `Exercise`; construct them as `new Exercise.ClassName(...)`. Do not implement a solution in the test runner. Each instance owns independent state. Unless explicitly allowed, null inputs are outside the domain. Failed operations leave state unchanged; validation happens before mutation.

Run from this directory with a JDK 17 or newer:

```bash
javac Exercise.java Main.java && java Main --stage prototype
javac Exercise.java Main.java && java Main --stage final
```

Edit `Exercise.java`; keep `Main.java` as the executable specification. The default stage is `final`. Each named check reports PASS or FAIL; failures and empty suites exit nonzero. Both stages intentionally begin unfinished.
