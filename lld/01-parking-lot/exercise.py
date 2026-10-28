def choose_spot(spots, vehicle_kind):
    """Validate free spots and return the smallest compatible spot ID, or None."""
    raise NotImplementedError


class ParkingLot:
    def __init__(self, spots):
        """Copy and validate (spot_id, kind) inventory; start with ticket number 1."""
        raise NotImplementedError

    def park(self, vehicle_id, kind):
        """Allocate atomically and return an isolated ticket, or None when full."""
        raise NotImplementedError

    def release(self, ticket_id):
        """Release an active integer ticket once; return its snapshot or None."""
        raise NotImplementedError

    def active_tickets(self):
        """Return independent ticket dictionaries ordered by ticket number."""
        raise NotImplementedError

    def available_spots(self):
        """Return free (spot_id, kind) pairs ordered by size rank and identifier."""
        raise NotImplementedError
