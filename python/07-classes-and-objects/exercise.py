class Note:
    def __init__(self, text):
        raise NotImplementedError

    def preview(self, limit):
        raise NotImplementedError

class Notebook:
    def __init__(self):
        raise NotImplementedError

    def add(self, text):
        raise NotImplementedError

    def all_notes(self):
        raise NotImplementedError

    def find(self, term):
        raise NotImplementedError
