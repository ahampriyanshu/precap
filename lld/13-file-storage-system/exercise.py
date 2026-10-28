"""Implement the prototype first, then the final service. See README.md."""

class FileCatalog:

    def __init__(self):
        """Create an empty name-to-size catalog."""
        raise NotImplementedError()

    def upload(self, name, size):
        """Add a unique nonempty name with nonnegative size; return bool success."""
        raise NotImplementedError()

    def get(self, name):
        """Return a stored byte count, including zero, or None if missing."""
        raise NotImplementedError()

class FileStorage:

    def __init__(self, quota):
        """Create an empty catalog at time 0 with a nonnegative byte quota."""
        raise NotImplementedError()

    def advance_to(self, timestamp):
        """Advance monotonically and remove entries at or beyond their expiry."""
        raise NotImplementedError()

    def upload(self, name, size, ttl=None):
        """Validate metadata before atomically adding a new entry within quota."""
        raise NotImplementedError()

    def get(self, name):
        """Return a fresh name/size/expires_at snapshot, or None when missing."""
        raise NotImplementedError()

    def copy(self, source, destination):
        """Copy metadata and absolute expiry to a new key, charging quota again."""
        raise NotImplementedError()

    def delete(self, name):
        """Delete once and release its size; absent names return False."""
        raise NotImplementedError()

    def usage(self):
        """Return the current sum of stored byte counts."""
        raise NotImplementedError()

    def search(self, prefix, limit=10):
        """Return fresh matches sorted by size descending then name ascending."""
        raise NotImplementedError()
