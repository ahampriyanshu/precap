class Circle:
    def __init__(self, radius):
        raise NotImplementedError

    @property
    def diameter(self):
        raise NotImplementedError

class Temperature:
    def __init__(self, celsius):
        raise NotImplementedError

    @property
    def celsius(self):
        raise NotImplementedError

    @celsius.setter
    def celsius(self, value):
        raise NotImplementedError

    @property
    def fahrenheit(self):
        raise NotImplementedError
