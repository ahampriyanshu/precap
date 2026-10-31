# Meeting Room Booking System

Half-open intervals allow one meeting to end exactly when the next starts. Two intervals conflict when each starts before the other ends. Capacity and availability are separate filters: each selected room must hold the requested seats independently.

```go
aStart, aEnd, bStart, bEnd := 0, 2, 2, 4
overlap := aStart < bEnd && bStart < aEnd
fmt.Println(overlap) // false: touching boundary
```

Multi-room allocation is one atomic decision. Collect enough qualifying rooms before reserving any, or a rejected request can block later bookings. Successful booking IDs remain reserved after cancellation to prevent accidental replay as a new reservation. Cancellation changes active schedules but keeps the lifetime registry. Return allocation order reflects the original capacity/ID selection.

Go models this service with a struct and pointer-receiver methods. Constructor functions return a pointer; validation failures return errors rather than panicking. Scalars in snapshot structs are copied by value. Maps, slices, and optional pointers still require detached copies when crossing the service boundary. Go maps do not have key iteration order; use ordered slices for ranked results. There are no threads, persistence, wall-clock reads, or external side effects in this exercise.

## Practice

Prototype: `NewRoomCalendar() *RoomCalendar`; `Reserve(start,end int) (bool,error)` requires start>=0,end>start, false on overlap; success appends. `Slots() [][2]int` detached start/end sorted half-open intervals.

Final: `NewMeetingRoomBooking(rooms map[string]int) (*MeetingRoomBooking,error)` copies nonempty IDs/positive capacities; empty catalog valid. `Book(id string,start,end,seats,roomCount int) ([]string,error)` validates nonempty id,start>=0,end>start,seats>=1,count>=1 before duplicate/availability. Each room must hold seats. Choose count available rooms by capacity ascending then ID ascending. Commit together and return selected order, or nil for insufficient rooms/lifetime-used ID without state change. Failed IDs reusable. `Cancel(id) bool` removes an active booking once but lifetime ID remains reserved. `Allocation(id) []string` detached original selection order, nil missing/cancelled. `Schedule(room) ([]Reservation,error)` unknown room errors; active bookings sorted start,end,id, with ID,Start,End,Seats fields. Multi-room bookings appear in every selected schedule. No clock cleanup. Pass roomCount=1 for a single room.

All identifiers and strings compare exactly and case-sensitively. Numeric inputs are typed `int`; booleans cannot be passed as amounts. Arithmetic and logical timestamps fit `int`. All supplied collection inputs that are retained must be copied. Every collection or pointer snapshot must be detached; separate service instances own independent state. A nil pointer or nil optional slice denotes absence, while an ordinary empty result collection is nonnil. Invalid calls leave state unchanged unless the contract explicitly accepts time and expires state on a valid unsuccessful call. The exported signatures in `exercise.go` are the API specification.

Edit `exercise.go`; retain the public types and signatures. `prototype` and `final` are separate stages. The executable tests recover panics as failures, report named checks, and exit nonzero on any failure. A successful run must execute at least one check. Tests use logical time or explicit synchronization where relevant.

Run from this directory with Go 1.22+ (the exercises also compile with Go 1.20):

```sh
go run main.go exercise.go --stage prototype
go run main.go exercise.go --stage final
```
