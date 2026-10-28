# Recipe Manager

## The problem

A recipe manager stores structured content that people can edit and revisit. Its central rules are easy to state: current recipe names must be unique, readers must have permission, and an edit must not rewrite an earlier revision. Designing the class means deciding who owns those rules and what an unsuccessful operation leaves behind. Ingredients and steps are ordered lists; they are content, rather than mathematical sets, so duplicates remain meaningful.

Separate identity from presentation. A recipe keeps the same identifier when its name changes. A version number identifies one snapshot within that recipe. A user identifier identifies a principal with explicit capabilities. Treating these as interchangeable strings inside a single list makes later operations difficult to reason about. The manager coordinates authorization, current names, and revision creation; a revision only represents content at one point in the history.

## Naive approach

Start with a list of dictionaries. Search the list for an identifier or duplicate name, then change the matching dictionary in place. Keep a second list of users and scan it before an edit. This is a reasonable way to learn the operations, and a small catalog may never need a more elaborate search index. A simple scan is also useful for listing recipes that contain an ingredient.

A shallow snapshot still shares nested content:

```python
current = {"name": "Soup", "steps": ["simmer"]}
history = [current.copy()]
current["steps"].append("serve")
print(history[0]["steps"])
assert history[0]["steps"] == ["simmer", "serve"]
```

The earlier revision changed without a revision operation. Copying the outer record protected its keys, but not the mutable list those keys reference.

For undo, copy the previous dictionary into a history list. However, copying the outer dictionary alone still shares its ingredient and step lists. Mutating one of those lists can silently change a supposedly historical recipe.

## Where the naive approach breaks

In-place editing erases evidence of what readers previously saw. Returning internal lists lets a caller bypass authorization and version creation entirely. Renaming before checking uniqueness can leave both the name lookup and content in an inconsistent state when the operation fails.

Discarding all versions after an undo also loses the audit trail. Python list slicing copies references into a new list; retaining k entries costs O(k), rather than O(1). More fundamentally, a destructive undo is a different product contract from restoring old content while preserving every revision. Decide which behavior is required before choosing the data structure.

## A better design

Use maps for users and recipes, a name-to-identifier map for current uniqueness, and an append-only list of snapshots per recipe. Store content as immutable tuples internally or make defensive copies at every boundary. Check the required capability and all failure conditions before appending a version or changing the name index. A write capability does not automatically grant read access in this exercise.

Represent retained content with immutable fields:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Revision:
    name: str
    steps: tuple[str, ...]

history = [Revision("Soup", ("simmer",))]
history.append(Revision("Tomato Soup", ("simmer", "serve")))
history.append(history[0])  # Restore content by appending a new position.
print([revision.name for revision in history])
assert len(history) == 3
```

Sharing an immutable revision value is safe; its list position supplies the new version number here. The manager still checks authorization and current-name uniqueness before appending. Frozen records containing mutable lists would not provide the same protection.

Hash lookups and name checks take expected O(1) time, excluding content copying. Creating a revision takes O(I + S) for I ingredients and S steps. Direct version selection is O(1), but returning its snapshot still copies its content. Ingredient search scans current recipes and sorts matching results; an inverted index could help frequent searches, at the cost of extra updates on every edit and restore.

## Real-world usage

The same responsibilities appear in document editors, configuration catalogs, and editorial tools. Stable identity allows references to survive renames; immutable revisions support review and recovery. This small manager has local permission records and sequential calls. Durable audit storage, identity verification, concurrent edits, and retention policies would require additional design. A version number alone does not prevent two writers from overwriting each other's intended changes; a larger API might require an expected current version.

## Practice

All arguments have the documented Python types; type coercion is unnecessary. Strings are case-sensitive. Ingredients and steps are lists of strings; empty lists, empty items, and duplicates are allowed and preserve order. Every returned dictionary/list is a detached snapshot, including nested lists. Instances must have independent state. No persistence or deletion is required.

**Prototype:** implement `RecipeDraft(name, ingredients, steps)` and `snapshot()`. The snapshot is `{"name": name, "ingredients": [...], "steps": [...]}`. Copy the input lists. The draft does not validate the name or manage permissions.

**Final:** implement `RecipeManager()` with these methods:

- `add_user(user_id, permissions) -> bool`: permissions is a list containing only `"read"` and/or `"write"`; duplicates are harmless. Empty permissions are allowed. Empty user IDs or unknown permissions raise `ValueError`, even for an existing ID. Return `False` for an existing valid ID, preserving its original permissions; otherwise register a copied permission set and return `True`.
- `add(user_id, name, ingredients, steps) -> str | None`: requires write. Empty name raises `ValueError` before permission checks. Return `None` for no permission or a currently used name. Success returns `"recipe1"`, `"recipe2"`, ... and creates v1. Rejected requests consume no identifier.
- `update(user_id, recipe_id, name, ingredients, steps) -> int | None`: the same name validation and write check apply. Missing recipe or name owned by another recipe returns `None`. Success appends a revision, even for identical content, and returns its number. Renaming frees the old current name.
- `get(user_id, recipe_id, version=None) -> dict | None`: requires read. `None` selects latest; an integer version selects that positive revision. Return `None` for no permission, missing recipe, or nonexistent version. A snapshot has exactly `id`, `version`, `name`, `ingredients`, and `steps`.
- `history(user_id, recipe_id) -> list[dict]`: requires read. Return snapshots in increasing version order, or `[]` for no permission/missing recipe.
- `rollback(user_id, recipe_id, version) -> int | None`: requires write; invalid target, missing recipe, or conflicting historical name returns `None`. Append the selected content as a new latest revision and return its number. Preserve all existing versions and the same recipe ID.
- `by_ingredient(user_id, ingredient) -> list[str]`: requires read; otherwise `[]`. Match exact ingredient membership in current content. Sort by ingredient count ascending, current name ascending, then ID ascending. A recipe appears once despite duplicate ingredients.

Invalid or rejected calls leave all state unchanged. Run `python main.py --stage prototype`, then `python main.py --stage final` (the default). Edit only `exercise.py`.
