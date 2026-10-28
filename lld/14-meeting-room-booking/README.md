# Meeting Room Booking System

## The problem

A meeting room booking system assigns limited rooms to requested time intervals. Each selected room must have enough seats, and no room may have overlapping active reservations. Requests can require several rooms together. Either every requested room is reserved or none is. The public result should also be reproducible: if several allocations are possible, the API needs a stated selection order.

The booking service owns allocation and cancellation. Rooms supply identity and capacity; bookings supply an interval, seat requirement, and the chosen room IDs. A successful booking has a stable identifier so cancellation can remove its exact reservations. The system does not need a separate class for every noun. Small records and one coordinating service can express these responsibilities clearly.

## Naive approach

Keep a list of bookings for every room. For each request, scan the rooms and check existing intervals. Reserve the first room that looks available. A single-room prototype can use this approach without much machinery: validate the interval, reject overlap, and otherwise append it.

Inclusive endpoints reject adjacent meetings:

```python
existing = (10, 20)
requested = (20, 30)
a, b = existing
c, d = requested
wrong_overlap = a <= d and c <= b
print(wrong_overlap)
assert wrong_overlap  # Incorrect for half-open intervals.
```

The shared endpoint 20 has no occupied duration in both intervals. Use strict comparisons for `[start, end)` after validating start < end.

A common interval check uses inclusive endpoints. Another common extension reserves rooms one at a time until enough have been found. Both approaches can appear correct in a demonstration containing only well-separated, single-room meetings. Their shortcomings become visible when meetings touch or when a multi-room request cannot be fully satisfied.

## Where the naive approach breaks

With inclusive endpoints, a meeting ending at 11 prevents another starting at 11. A common booking policy models an interval as half-open: `[start, end)`. Two intervals overlap precisely when `first_start < second_end` and `second_start < first_end`. Equal boundaries do not overlap, while containment and partial intersection do.

Incremental reservation creates a more serious failure. If a request needs two rooms and only one is available, reserving that one before returning failure leaks a reservation. Future requests then see capacity consumed by a booking that never succeeded. Cancellation also becomes unreliable if it guesses which rows to remove from an interval alone, because distinct rooms can have identical intervals.

## A better design

Separate selection from commitment. First validate all arguments and check booking-ID reuse. Next collect rooms whose capacity is sufficient and whose active reservations do not overlap the requested interval. Sort eligible rooms by capacity ascending, then room ID ascending. Only after enough rooms have been selected should the service record the booking and its room assignments. This preserves the all-or-none invariant in sequential execution.

Selection must finish before any reservation is installed:

```python
rooms = {"A": 4, "B": 4, "C": 8}
conflicting = {"A", "C"}
required_rooms, seats = 2, 4
eligible = sorted((capacity, room) for room, capacity in rooms.items()
                  if capacity >= seats and room not in conflicting)
chosen = eligible[:required_rooms]
plan = chosen if len(chosen) == required_rooms else None
print(plan)
assert plan is None
assert conflicting == {"A", "C"}
```

B remains free when the two-room request cannot be satisfied. Conflict detection is supplied as input in this fragment; the booking service must derive it and commit all chosen schedules within the same serialized boundary.

Visiting R rooms and their B active room-reservation entries costs O(R + B); sorting up to R eligible rooms adds O(R log R). A booking-ID map gives expected O(1) lookup for cancellation; removing assignments can still require scans of affected room schedules. Sorted interval structures can improve conflict queries, but Python list insertion remains linear. Measure the workload before introducing interval trees or more complicated indexes.

## Real-world usage

The same design applies to shared equipment, classrooms, and reservable workspaces. Half-open intervals make adjacent reservations possible, deterministic allocation makes behavior testable, and atomic selection prevents partial commitments. This exercise handles sequential calls and integer time coordinates. A deployed service would also need a time-zone policy, persistence, and concurrency control around the availability check and write. Sorting candidates does not itself prevent two concurrent requests from claiming the same room. Recurrence, setup buffers, attendee calendars, and payments are outside this focused model.

## Practice

Inputs have the documented types. Times, capacities, seat requests, and counts are integers. Room and booking IDs are case-sensitive strings. Each returned list/dictionary must be a detached snapshot, and instances must be independent. Time is an abstract coordinate; no clock, time zones, recurrence, or elapsed-time cleanup is used.

**Prototype:** implement `RoomCalendar()`:

- `reserve(start, end) -> bool`: `start >= 0` and `end > start` are required, otherwise raise `ValueError` unchanged. Intervals are half-open. Return `False` on any overlap, otherwise append the interval and return `True`.
- `slots() -> list[tuple[int, int]]`: return all accepted intervals sorted by start then end, as a fresh list. Repeating the same reservation overlaps and returns `False`.

**Final:** implement `MeetingRoomBooking(rooms)`, where `rooms` is a dictionary `{room_id: capacity}`. Copy the dictionary. Empty catalogs are allowed; an empty room ID or capacity below 1 raises `ValueError`.

- `book(booking_id, start, end, seats, room_count=1) -> list[str] | None`: require nonempty booking ID, `start >= 0`, `end > start`, `seats >= 1`, and `room_count >= 1`; otherwise raise `ValueError` before any other check. Each selected room must independently hold at least `seats` people. Choose exactly `room_count` available rooms by `(capacity, room_id)` ascending. Return their IDs in that order and commit them together. If too few rooms qualify, return `None` without reserving anything or consuming the ID.
- A successfully used booking ID remains reserved for the instance's lifetime, including after cancellation. Repeating `book` with that ID returns `None`, even if arguments match; validation still happens first. A failed request's ID may be retried.
- `cancel(booking_id) -> bool`: cancel all assignments for one active booking and return `True`. Missing or already cancelled bookings return `False` without changing other bookings.
- `allocation(booking_id) -> list[str] | None`: return a fresh list of room IDs in the original selection order for an active booking. Missing or cancelled bookings return `None`.
- `schedule(room_id) -> list[dict]`: unknown room raises `ValueError`. Return active reservations for that room sorted by `(start, end, id)` ascending. Each entry has exactly `{"id": booking_id, "start": start, "end": end, "seats": seats}`. A multi-room booking appears once in each assigned room's schedule.

Invalid and unsuccessful requests preserve all schedules and existing allocations. Run `python main.py --stage prototype`, then `python main.py --stage final` (the default). Edit only `exercise.py`.
