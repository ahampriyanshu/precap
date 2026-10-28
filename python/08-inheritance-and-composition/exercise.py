class Lowercase:
    def apply(self, text):
        raise NotImplementedError

class TextOperation:
    def apply(self, text):
        raise NotImplementedError

class Strip(TextOperation):
    def apply(self, text):
        raise NotImplementedError

class Replace(TextOperation):
    def __init__(self, old, new):
        raise NotImplementedError

    def apply(self, text):
        raise NotImplementedError

class Pipeline:
    def __init__(self, operations):
        raise NotImplementedError

    def apply(self, text):
        raise NotImplementedError
