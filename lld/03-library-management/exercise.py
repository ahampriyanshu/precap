def available_copies(copies, title):
    """Return sorted free copy IDs for the exact title without changing records."""
    raise NotImplementedError


class Library:
    def __init__(self, copies):
        """Copy validated (unique copy_id, title) records with no initial loans."""
        raise NotImplementedError

    def borrow(self, member_id, title):
        """Lend the smallest free copy; reject a member's duplicate active title."""
        raise NotImplementedError

    def return_copy(self, copy_id, member_id):
        """Release only the owner's loan; return False if no active loan exists."""
        raise NotImplementedError

    def available(self, title):
        """Return a fresh sorted list of free copy identifiers for this title."""
        raise NotImplementedError

    def loans(self):
        """Return isolated loan dictionaries sorted by copy identifier."""
        raise NotImplementedError
