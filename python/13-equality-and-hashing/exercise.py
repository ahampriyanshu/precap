def same_label(left, right):
    raise NotImplementedError

class UserKey:
    def __init__(self, name, domain):
        raise NotImplementedError

    def __eq__(self, other):
        raise NotImplementedError

    def __hash__(self):
        raise NotImplementedError
