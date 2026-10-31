# Recipe Manager in C++

Current names and historical names serve different purposes. Uniqueness applies only to latest revisions, allowing a renamed recipe's old name to be reused. Rollback appends historical content as a new revision; it never deletes the intervening audit trail.

```cpp
std::map<std::string,std::vector<Recipe>> revisions;
// latest = revisions.at(id).back(); version numbers are one based.
```

Copy ingredient and step vectors into each revision, then return value copies from get/history. Sharing mutable vectors between versions would rewrite history after a later edit. Read and write permissions are independent: write permission does not imply read permission. Validate names before permission checks and consume recipe IDs only after acceptance. Rollback must recheck current-name collisions because another recipe may now own the historical name. Ingredient search uses current revisions, membership without duplicate hits, and ingredient count including duplicates as a sorting key.

C++ contract conventions: numeric values use signed `Int` (`long long`); all inputs and intermediate arithmetic are within its representable range. `Opt<T>` means `std::optional<T>` and absence is `std::nullopt`; `Vec<T>` means `std::vector<T>`. Invalid documented arguments throw `std::invalid_argument`. Inputs passed by const reference remain caller owned. Returned containers and records own their contents. Calls use the declared C++ parameter types. Implicit conversions performed by the caller are outside the runtime validation contract. Unless a lesson states otherwise, string ordering is lexicographic over Unicode code points (`Text`) or UTF-8 identifiers (`std::string`).



## Practice

All arguments use their declared C++ parameter types. Strings are case-sensitive. Ingredients and steps are lists of strings; empty lists, empty items, and duplicates are allowed and preserve order. Every returned value record/list is a detached snapshot, including nested lists. Instances must have independent state. No persistence or deletion is required.

**Prototype:** implement `RecipeDraft(name, ingredients, steps)` and `snapshot()`. The snapshot is the fields declared in the value record below. Copy the input lists. The draft does not validate the name or manage permissions.

**Final:** implement `RecipeManager()` with these methods:

- `add_user()`: permissions is a list containing only `"read"` and/or `"write"`; duplicates are harmless. Empty permissions are allowed. Empty user IDs or unknown permissions raise `std::invalid_argument`, even for an existing ID. Return `false` for an existing valid ID, preserving its original permissions; otherwise register a copied permission set and return `true`.
- `add()`: requires write. Empty name raises `std::invalid_argument` before permission checks. Return `nullopt` for no permission or a currently used name. Success returns `"recipe1"`, `"recipe2"`, ... and creates v1. Rejected requests consume no identifier.
- `update()`: the same name validation and write check apply. Missing recipe or name owned by another recipe returns `nullopt`. Success appends a revision, even for identical content, and returns its number. Renaming frees the old current name.
- `get()`: requires read. `nullopt` selects latest; an integer version selects that positive revision. Return `nullopt` for no permission, missing recipe, or nonexistent version. A snapshot has exactly `id`, `version`, `name`, `ingredients`, and `steps`.
- `history()`: requires read. Return snapshots in increasing version order, or `[]` for no permission/missing recipe.
- `rollback()`: requires write; invalid target, missing recipe, or conflicting historical name returns `nullopt`. Append the selected content as a new latest revision and return its number. Preserve all existing versions and the same recipe ID.
- `by_ingredient()`: requires read; otherwise `[]`. Match exact ingredient membership in current content. Sort by ingredient count ascending, current name ascending, then ID ascending. A recipe appears once despite duplicate ingredients.

Invalid or rejected calls leave all state unchanged.

The public C++ API below is authoritative for field types and return values. `erase` is used where another language might use a method named `delete`, because `delete` is a C++ keyword. Returned records are value snapshots with the documented named fields; mutating a record or its nested vectors cannot affect the service.

```cpp
struct DraftSnapshot {std::string name;Strings ingredients,steps;bool operator==(const DraftSnapshot&)const=default;};
struct Recipe {std::string id;Int version;std::string name;Strings ingredients,steps;bool operator==(const Recipe&)const=default;};
class RecipeDraft { public:
 RecipeDraft(std::string name,Strings ingredients,Strings steps);
 DraftSnapshot snapshot() const;
};
class RecipeManager { public:
 RecipeManager();
 bool add_user(const std::string& id,const Strings& permissions);
 Opt<std::string> add(const std::string& user,const std::string& name,const Strings& ingredients,const Strings& steps);
 Opt<Int> update(const std::string& user,const std::string& id,const std::string& name,const Strings& ingredients,const Strings& steps);
 Opt<Recipe> get(const std::string& user,const std::string& id,Opt<Int> version=std::nullopt) const;
 Vec<Recipe> history(const std::string& user,const std::string& id) const;
 Opt<Int> rollback(const std::string& user,const std::string& id,Int version);
 Strings by_ingredient(const std::string& user,const std::string& ingredient) const;
};
```


Compile and run from this directory:

```sh
c++ -std=c++20 -O2 -Wall -Wextra -pedantic -pthread main.cpp -o practice
./practice --stage prototype
./practice --stage final
```

Edit `exercise.hpp`. Both stages start unfinished and must report failures until implemented. Keep `main.cpp` as the executable contract. The runner returns nonzero for a failed check, an unexpected exception, an invalid stage, or an empty suite. C++20 and only the standard library are required.
