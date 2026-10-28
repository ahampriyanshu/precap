"""Implement string mappings and LIFO transaction boundaries."""

class KeyValueStore:
    def __init__(self):
        """Create independent empty storage."""
        raise NotImplementedError
    def set(self, key, value):
        """Insert or replace a string value; return None."""
        raise NotImplementedError
    def get(self, key):
        """Return the value or None for absence; preserve empty strings."""
        raise NotImplementedError
    def delete(self, key):
        """Remove a key if present and return whether it existed."""
        raise NotImplementedError

class TransactionalStore:
    def __init__(self):
        """Create an empty base view at transaction depth zero."""
        raise NotImplementedError
    def set(self, key, value):
        """Write only to the currently visible transaction view."""
        raise NotImplementedError
    def get(self, key):
        """Read the current view, returning None for absence."""
        raise NotImplementedError
    def delete(self, key):
        """Remove from the current view and return a bool."""
        raise NotImplementedError
    def begin(self):
        """Start a nested transaction and return its depth."""
        raise NotImplementedError
    def commit(self):
        """Merge the top transaction into its parent; error at depth zero."""
        raise NotImplementedError
    def rollback(self):
        """Discard the top transaction; error at depth zero."""
        raise NotImplementedError
    def depth(self):
        """Return the number of active nested transactions."""
        raise NotImplementedError
    def snapshot(self, prefix=""):
        """Return a fresh, key-sorted dictionary filtered by prefix."""
        raise NotImplementedError
