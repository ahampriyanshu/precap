def touch_order(keys, key):
    """Return a new oldest-to-newest order with key appearing once at the end."""
    raise NotImplementedError


class LRUCache:
    def __init__(self, capacity):
        """Create independent storage with a validated nonnegative integer capacity."""
        raise NotImplementedError

    def put(self, key, value):
        """Validate, insert or update, refresh recency, and evict if needed."""
        raise NotImplementedError

    def get(self, key, default=None):
        """Return and refresh a hit; return default without recency changes on miss."""
        raise NotImplementedError

    def delete(self, key):
        """Remove a key if present and return whether an entry was removed."""
        raise NotImplementedError

    def items(self):
        """Return an independent list of (key, value) pairs, least recent first."""
        raise NotImplementedError
