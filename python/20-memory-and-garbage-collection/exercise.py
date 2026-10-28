def observe(obj):
    raise NotImplementedError

class WeakCache:
    def __init__(self):
        raise NotImplementedError

    def put(self, key, obj):
        raise NotImplementedError

    def get(self, key):
        raise NotImplementedError

    def discard(self, key):
        raise NotImplementedError

    def __len__(self):
        raise NotImplementedError
