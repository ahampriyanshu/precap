# Message Broker

A retained log owns messages once, while each consumer group owns its own cursor, attempt count and in-flight state. Acknowledging one group must not consume another group's delivery.

```go
type GroupProgress struct { Position,Attempt int; InFlight bool }
a, b := GroupProgress{}, GroupProgress{}
a.Position++
fmt.Println(b.Position) // 0: independent cursor
```

Polling an in-flight item repeats the same delivery; an explicit negative acknowledgment enables a new attempt. At the attempt limit, move the message to that group's dead letters exactly once and advance. Lifetime ID uniqueness is different from queue membership: consuming or dead-lettering a message must not permit its ID to be published again. This exercise has no timeout-driven redelivery.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `NewMessageQueue() *MessageQueue`; `Publish(id,payload string) bool` accepts a lifetime-unique ID; duplicate false preserving payload even after consumption. `Consume() *Message` destructively returns oldest fresh snapshot, nil empty. Empty IDs and payloads valid.

Final: `NewMessageBroker(maxAttempts int) (*MessageBroker,error)` positive limit counts initial delivery. `Publish` appends lifetime-unique immutable messages. `Subscribe(group string) bool` starts at earliest retained message, duplicate false preserving progress; empty group valid. `Poll(group) *Delivery` nil unknown/caught up; initial attempt 1, repeated in-flight poll same attempt. After retryable Nack, next poll redelivers same position with next attempt before later items. `Ack(group,id) bool` succeeds only matching current in-flight, clears and advances; unknown/wrong/duplicate/between-nack-and-poll false unchanged. `Nack(group,id) *string` nil invalid; valid clears in-flight and returns retry if below max, else appends group-specific DeadLetter with Attempts, advances, returns dead-letter. `DeadLetters(group) []DeadLetter` fresh failure-order snapshots, unknown empty, never drains. New message resets attempts. No clocks/capacity/deletion/replay.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
