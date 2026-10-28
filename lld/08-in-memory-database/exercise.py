"""Implement record fields, then logical-time TTL and field version history."""

class RecordStore:
    def __init__(self):
        """Create independent record storage."""
        raise NotImplementedError
    def set(self, key, field, value):
        """Write a string value into one record field; return None."""
        raise NotImplementedError
    def get(self, key, field):
        """Return the field value or None."""
        raise NotImplementedError
    def scan(self, key, prefix=""):
        """Return a fresh list of matching (field, value) tuples in name order."""
        raise NotImplementedError

class TemporalDatabase:
    def __init__(self):
        """Create independent timelines and accepted logical time."""
        raise NotImplementedError
    def set(self, ts, key, field, value, ttl=None):
        """Append a version with a positive optional TTL; validate before mutation."""
        raise NotImplementedError
    def get(self, ts, key, field):
        """Read the current value at nondecreasing logical time ts."""
        raise NotImplementedError
    def delete(self, ts, key, field):
        """Append a tombstone for a visible field; return whether it existed."""
        raise NotImplementedError
    def compare_and_set(self, ts, key, field, expected, value, ttl=None):
        """Replace a matching visible value and lifetime; return a bool."""
        raise NotImplementedError
    def scan(self, ts, key, prefix=""):
        """Return a fresh name-sorted list of visible (field, value) tuples."""
        raise NotImplementedError
    def get_at(self, ts, key, field, at):
        """Read the last processed version at or before at; require 0 <= at <= ts."""
        raise NotImplementedError
