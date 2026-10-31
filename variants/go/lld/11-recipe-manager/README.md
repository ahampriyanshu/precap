# Recipe Manager

Immutable revisions separate historical truth from the current-name index. Updating or rolling back appends a revision, while renaming frees only the old current name. A historical name can be occupied by another recipe and block rollback.

```go
ingredients := []string{"salt", "water"}
snapshot := append([]string{}, ingredients...)
snapshot[0] = "pepper"
fmt.Println(ingredients[0]) // salt: detached slice
```

Permissions are explicit capabilities: read does not imply write and write does not imply read. Validate content before permission checks when the API requires a structural error even for an unauthorized caller. Copy nested ingredients and steps both when accepting content and when returning a revision. Otherwise a caller can rewrite history without going through Update.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `NewRecipeDraft(name string,ingredients,steps []string) *RecipeDraft`; `Snapshot() Draft` copies lists both in and out; no name validation/permissions.

Final: `NewRecipeManager()`. `AddUser(user string,permissions []string) (bool,error)` requires nonempty user and only read/write permission strings; duplicate permissions harmless, empty allowed. Validate even for existing user; duplicate valid registration false preserving permissions. `Add(user,name string,ingredients,steps []string) (*string,error)` validates nonempty name first, then requires write. Unauthorized/name-used returns nil without consuming recipeN ID; success appends v1. `Update(user,id,name,...)(*int,error)` same name validation; requires write, existing ID, and name unused by another current recipe. Appends even identical content; returns version. `Get(user,id string,version *int) *Recipe` requires read; nil version latest, positive existing version otherwise; nil denied/missing/invalid. `History(user,id) []Recipe` read-only, oldest first. `Rollback(user,id string,version int) *int` requires write and valid target with no current-name conflict; append selected content as latest, preserve ID/history. `ByIngredient(user,ingredient) []string` read-only; exact current membership once per recipe; order by ingredient slice length, current name, ID. Empty list items, duplicates and order retained. Invalid/rejected mutations preserve names, versions and next ID.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
