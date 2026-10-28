"""Implement the prototype first, then the final service. See README.md."""

class RoomCalendar:

    def __init__(self):
        """Create an empty single-room calendar."""
        raise NotImplementedError()

    def reserve(self, start, end):
        """Reserve a valid half-open interval atomically; return False on overlap."""
        raise NotImplementedError()

    def slots(self):
        """Return accepted intervals as a fresh sorted list of tuples."""
        raise NotImplementedError()

class MeetingRoomBooking:

    def __init__(self, rooms):
        """Copy a room-ID/capacity map; capacities must be positive and IDs nonempty."""
        raise NotImplementedError()

    def book(self, booking_id, start, end, seats, room_count=1):
        """Select by capacity/ID and reserve all requested rooms together, or None."""
        raise NotImplementedError()

    def cancel(self, booking_id):
        """Cancel an active booking exactly once; its successful ID stays reserved."""
        raise NotImplementedError()

    def allocation(self, booking_id):
        """Return a fresh original room allocation for an active booking, or None."""
        raise NotImplementedError()

    def schedule(self, room_id):
        """List fresh active reservation snapshots in start/end/ID order for a room."""
        raise NotImplementedError()
