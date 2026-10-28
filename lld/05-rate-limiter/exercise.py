def allow_request(recent, limit, window, now):
    """Validate history and return (allowed, fresh active accepted timestamps)."""
    raise NotImplementedError


class SlidingWindowLimiter:
    def __init__(self, limit, window):
        """Validate positive integer settings and initialize per-client state."""
        raise NotImplementedError

    def allow(self, client_id, now):
        """Expire the left boundary, enforce per-client monotonic time, and decide."""
        raise NotImplementedError

    def history(self, client_id):
        """Return isolated retained accepted timestamps without advancing time."""
        raise NotImplementedError
