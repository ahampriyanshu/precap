"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_zero(self):
        self.assertEqual(exercise.minutes_to_seconds(0), 0)


    def test_one(self):
        self.assertEqual(exercise.minutes_to_seconds(1), 60)


    def test_several(self):
        self.assertEqual(exercise.minutes_to_seconds(15), 900)


    def test_large(self):
        self.assertEqual(exercise.minutes_to_seconds(10000), 600000)


    def test_integer(self):
        self.assertIsInstance(exercise.minutes_to_seconds(2), int)


class FinalTests(unittest.TestCase):
    def test_seconds(self):
        self.assertEqual(exercise.split_seconds(125), (2, 5))


    def test_minute_boundary(self):
        self.assertEqual(exercise.split_seconds(60), (1, 0))
        self.assertEqual(exercise.split_seconds(0), (0, 0))


    def test_greeting(self):
        self.assertEqual(exercise.greeting(" Ada ", 2), "Ada: 2 unread")


    def test_empty_name(self):
        self.assertEqual(exercise.greeting("  ", 0), ": 0 unread")


    def test_flags(self):
        self.assertIs(exercise.parse_enabled(" TRUE "), True)
        self.assertIs(exercise.parse_enabled("False"), False)


    def test_unknown_flag(self):
        self.assertIsNone(exercise.parse_enabled("yes"))
        self.assertIsNone(exercise.parse_enabled(""))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
