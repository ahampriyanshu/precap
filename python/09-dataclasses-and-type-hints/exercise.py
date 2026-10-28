from dataclasses import dataclass, field

# Add the requested dataclass decorator and fields.
class Point:
    def __init__(self, x: int, y: int):
        raise NotImplementedError

# Replace this initializer with dataclass fields and generated methods.
class Task:
    def __init__(self, title: str, done: bool = False, tags=None):
        raise NotImplementedError

def completed_titles(tasks: list[Task]) -> list[str]:
    raise NotImplementedError
