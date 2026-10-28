"""Implement the prototype first, then the final service. See README.md."""

def split_equal(total, participants):
    """Allocate nonnegative integer cents equally with sorted remainder recipients."""
    raise NotImplementedError()

class ExpenseSharing:

    def __init__(self, members):
        """Copy a fixed nonempty list of distinct, nonempty members with zero balances."""
        raise NotImplementedError()

    def add_expense(self, operation_id, payer, total, participants):
        """Apply a positive equal-split expense once; exact canonical retries are False."""
        raise NotImplementedError()

    def settle(self, operation_id, debtor, creditor, amount):
        """Record a bounded debtor-to-creditor payment once, preserving zero-sum balances."""
        raise NotImplementedError()

    def balances(self):
        """Return a fresh lexicographically ordered map of all zero-sum net balances."""
        raise NotImplementedError()

    def suggest_settlements(self):
        """Greedily pair alphabetic debtors and creditors on copies without mutating state."""
        raise NotImplementedError()
