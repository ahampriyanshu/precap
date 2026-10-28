"""Implement validated balances, atomic transfers, and successful-request replay."""

class BalanceAccount:
    def __init__(self):
        """Create an independent account with zero balance."""
        raise NotImplementedError

    def balance(self):
        """Return the current integer balance."""
        raise NotImplementedError

    def deposit(self, amount):
        """Add a positive amount; raise ValueError otherwise; return balance."""
        raise NotImplementedError

    def withdraw(self, amount):
        """Debit a positive amount if affordable; return bool without overdrafts."""
        raise NotImplementedError

class Bank:
    def __init__(self):
        """Create independent account, spending, and successful-request storage."""
        raise NotImplementedError

    def create_account(self, account_id):
        """Create a zero-balance account, returning False on duplicates."""
        raise NotImplementedError

    def balance(self, account_id):
        """Return an integer balance or None for an unknown account."""
        raise NotImplementedError

    def deposit(self, account_id, amount):
        """Validate amount first; return new balance or None if missing."""
        raise NotImplementedError

    def transfer(self, request_id, source, target, amount):
        """Replay identical successes; reject conflicting IDs; transfer atomically."""
        raise NotImplementedError

    def top_spenders(self, limit):
        """Return a fresh ranked list of (account_id, outgoing_total) tuples."""
        raise NotImplementedError
