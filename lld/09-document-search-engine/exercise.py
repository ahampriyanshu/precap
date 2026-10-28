"""Implement exact token rules and a mutable positional document index."""

def tokenize(text):
    """Return lowercase ASCII letter/digit runs, preserving order and duplicates."""
    raise NotImplementedError

class SearchEngine:
    def __init__(self):
        """Create independent document and index storage."""
        raise NotImplementedError
    def add(self, doc_id, text):
        """Add a document once; duplicates return False without changing text."""
        raise NotImplementedError
    def get(self, doc_id):
        """Return exact stored text or None for an unknown identifier."""
        raise NotImplementedError
    def update(self, doc_id, text):
        """Replace text and postings for an existing document; return a bool."""
        raise NotImplementedError
    def delete(self, doc_id):
        """Remove text and every posting for this document; return a bool."""
        raise NotImplementedError
    def search(self, term, limit=10):
        """Require one query token; rank (doc_id, frequency) by -score then ID."""
        raise NotImplementedError
    def search_phrase(self, phrase, limit=10):
        """Rank consecutive-token phrase matches, counting overlapping starts."""
        raise NotImplementedError
    def stats(self):
        """Return (current_document_count, current_total_token_count)."""
        raise NotImplementedError
