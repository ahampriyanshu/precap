class SafeCounter:
    def __init__(self):
        raise NotImplementedError

    def increment(self):
        raise NotImplementedError

    @property
    def value(self):
        raise NotImplementedError

def count_words(chunks):
    raise NotImplementedError
