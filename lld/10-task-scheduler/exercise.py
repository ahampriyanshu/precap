"""Implement deterministic priorities and a logical-time lease lifecycle."""

class PriorityQueue:
    def __init__(self):
        """Create independent pending tasks and an identifier counter."""
        raise NotImplementedError
    def add(self, name, priority):
        """Add one task and return its next numeric identifier."""
        raise NotImplementedError
    def pop(self):
        """Remove highest priority then oldest ID; return (id, name) or None."""
        raise NotImplementedError

class TaskScheduler:
    def __init__(self):
        """Create independent task, worker, token, and logical-time state."""
        raise NotImplementedError
    def add_task(self, name, priority):
        """Create a pending task and return its next numeric ID."""
        raise NotImplementedError
    def add_worker(self, worker_id, capacity):
        """Validate positive capacity; register once and return a bool."""
        raise NotImplementedError
    def dispatch(self, ts, worker_id, lease):
        """Expire old leases, enforce quota, assign best task, return snapshot."""
        raise NotImplementedError
    def complete(self, ts, task_id, token):
        """Finish only the exact current unexpired lease; return a bool."""
        raise NotImplementedError
    def get_task(self, ts, task_id):
        """Expire leases and return a fresh task dictionary or None."""
        raise NotImplementedError
    def active(self, ts, worker_id):
        """Expire leases and return fresh running-task snapshots in ID order."""
        raise NotImplementedError
