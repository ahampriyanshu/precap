# Task Scheduler

Priority and lease validity are independent dimensions. A task can be pending, running with a specific lease, or permanently done. Expiry returns a running task to pending and reclaims worker capacity.

```go
type Lease struct { Token,ExpiresAt int }
old, current := Lease{Token: 1}, Lease{Token: 2}
fmt.Println(old.Token == current.Token) // stale worker cannot complete current lease
```

A monotonically increasing token fences stale completion, even if the same worker receives the task again. Every valid timed call expires leases before answering, including unknown-worker requests. Invalid duration must not advance time or trigger expiry. Numeric task IDs break priority ties; lexicographic string IDs would misorder 10 and 2. Logical timestamps avoid sleeps and make the exact expiry boundary testable.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `NewPriorityQueue() *PriorityQueue`; `Add(name string,priority int) int` assigns increasing IDs from 1; `Pop() *QueuedTask` removes highest priority then smallest numeric ID, nil empty. Names may duplicate or be empty, priorities signed.

Final: `NewTaskScheduler() *TaskScheduler`; `AddTask(name,priority) int`; `AddWorker(worker string,capacity int) (bool,error)` validates positive capacity before duplicate handling; duplicate preserves capacity. Worker IDs are strings, including empty. `Dispatch(ts int,worker string,lease int) (*Task,error)` validates positive lease before time, expires leases, returns nil for unknown/full/no pending. Success selects highest priority then smallest ID and globally increasing Token from 1; failures do not consume tokens. Running lifetime [ts,ts+lease). `Complete(ts,id,token) (bool,error)` expires first, succeeds only for current running matching token, then done with nil assignment fields. `GetTask(ts,id) (*Task,error)` and `Active(ts,worker) ([]Task,error)` expire first; active sorts numeric IDs, unknown worker empty. Only these timed methods accept nonnegative nondecreasing time, including valid failures. Negative/regressing timestamps error without time/state change. Expired tasks become pending with nil assignment fields; every dispatch gets a fresh token. Task snapshots contain exactly the exported fields; Status pending/running/done.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
