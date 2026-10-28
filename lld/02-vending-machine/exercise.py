def change_due(price, paid):
    """Return integer change; reject invalid amounts and insufficient payment."""
    raise NotImplementedError


class VendingMachine:
    def __init__(self, products):
        """Copy validated (code, positive price, nonnegative stock) products."""
        raise NotImplementedError

    def insert(self, amount):
        """Add a positive integer amount and return the resulting credit."""
        raise NotImplementedError

    def balance(self):
        """Return the current customer's integer credit."""
        raise NotImplementedError

    def select(self, code):
        """Complete a sale atomically, returning code and change; preserve failures."""
        raise NotImplementedError

    def refund(self):
        """Return all current credit once and reset credit to zero."""
        raise NotImplementedError

    def inventory(self):
        """Return a new catalog dictionary with independent nested item dictionaries."""
        raise NotImplementedError
