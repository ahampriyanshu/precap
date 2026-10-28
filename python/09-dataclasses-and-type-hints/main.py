"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise
import dataclasses
import typing

STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_fields(self):
        point=exercise.Point(2, 3)
        self.assertEqual((point.x, point.y), (2, 3))


    def test_equal(self):
        self.assertEqual(exercise.Point(1, 2), exercise.Point(1, 2))


    def test_different(self):
        self.assertNotEqual(exercise.Point(1, 2), exercise.Point(2, 1))


    def test_frozen(self):
        point=exercise.Point(1, 2)
        with self.assertRaises((AttributeError, TypeError)):
            point.x=4


    def test_dataclass(self):
        self.assertTrue(dataclasses.is_dataclass(exercise.Point))
        self.assertEqual(typing.get_type_hints(exercise.Point), {"x": int, "y": int})


class FinalTests(unittest.TestCase):
    def test_defaults(self):
        task=exercise.Task("read")
        self.assertEqual((task.title, task.done, task.tags), ("read", False, []))


    def test_independent_tags(self):
        a=exercise.Task("a")
        b=exercise.Task("b")
        a.tags.append("urgent")
        self.assertEqual(b.tags, [])


    def test_mutable(self):
        task=exercise.Task("read")
        task.done=True
        self.assertTrue(task.done)


    def test_completed(self):
        tasks=[exercise.Task("a", True), exercise.Task("b"), exercise.Task("a", True)]
        self.assertEqual(exercise.completed_titles(tasks), ["a", "a"])


    def test_empty(self):
        self.assertEqual(exercise.completed_titles([]), [])


    def test_nonmutation(self):
        task=exercise.Task("a", True, ["x"])
        exercise.completed_titles([task])
        self.assertEqual(task, exercise.Task("a", True, ["x"]))


    def test_dataclass_and_hints(self):
        self.assertTrue(dataclasses.is_dataclass(exercise.Task))
        self.assertEqual(typing.get_type_hints(exercise.Task), {"title": str, "done": bool, "tags": list[str]})
        self.assertEqual(typing.get_type_hints(exercise.completed_titles), {"tasks": list[exercise.Task], "return": list[str]})


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
