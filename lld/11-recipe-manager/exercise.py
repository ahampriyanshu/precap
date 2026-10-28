"""Implement the prototype first, then the final service. See README.md."""

class RecipeDraft:

    def __init__(self, name, ingredients, steps):
        """Own copies of the draft's ordered ingredient and step lists."""
        raise NotImplementedError()

    def snapshot(self):
        """Return a fresh name/ingredients/steps dictionary, including fresh lists."""
        raise NotImplementedError()

class RecipeManager:

    def __init__(self):
        """Start with no users or recipes and the next successful ID recipe1."""
        raise NotImplementedError()

    def add_user(self, user_id, permissions):
        """Register explicit read/write permissions; invalid data raises ValueError."""
        raise NotImplementedError()

    def add(self, user_id, name, ingredients, steps):
        """Create v1 with a unique current name; return ID or None on rejection."""
        raise NotImplementedError()

    def update(self, user_id, recipe_id, name, ingredients, steps):
        """Append a revision after write/identity/name checks; return version or None."""
        raise NotImplementedError()

    def get(self, user_id, recipe_id, version=None):
        """Read a detached revision snapshot; None means latest or a rejected read."""
        raise NotImplementedError()

    def history(self, user_id, recipe_id):
        """Return detached snapshots in version order, or [] for a rejected read."""
        raise NotImplementedError()

    def rollback(self, user_id, recipe_id, version):
        """Append historical content as a new revision; preserve the full audit trail."""
        raise NotImplementedError()

    def by_ingredient(self, user_id, ingredient):
        """Read matching current IDs ordered by ingredient count, name, then ID."""
        raise NotImplementedError()
