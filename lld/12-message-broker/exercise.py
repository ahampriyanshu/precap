"""Implement the prototype first, then the final service. See README.md."""

class MessageQueue:

    def __init__(self):
        """Create an empty FIFO and lifetime message-ID registry."""
        raise NotImplementedError()

    def publish(self, message_id, payload):
        """Append a new ID once; return False for duplicates, even after consumption."""
        raise NotImplementedError()

    def consume(self):
        """Destructively return a fresh oldest message dictionary, or None."""
        raise NotImplementedError()

class MessageBroker:

    def __init__(self, max_attempts=2):
        """Set a positive delivery-attempt limit and create an empty retained log."""
        raise NotImplementedError()

    def publish(self, message_id, payload):
        """Append one immutable message per lifetime ID; return success as bool."""
        raise NotImplementedError()

    def subscribe(self, group_id):
        """Create independent progress from the oldest message; duplicates are False."""
        raise NotImplementedError()

    def poll(self, group_id):
        """Return one delivery snapshot; polling an in-flight item repeats its attempt."""
        raise NotImplementedError()

    def ack(self, group_id, message_id):
        """Advance only a matching current in-flight delivery; invalid calls are False."""
        raise NotImplementedError()

    def nack(self, group_id, message_id):
        """Clear a delivery for retry or append its final failure to this group's DLQ."""
        raise NotImplementedError()

    def dead_letters(self, group_id):
        """Return a fresh list of fresh group-specific failure dictionaries in order."""
        raise NotImplementedError()
