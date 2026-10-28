"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise
from unittest import mock

STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_positive(self):
        self.assertEqual(exercise.parse_count("12"), 12)


    def test_zero(self):
        self.assertEqual(exercise.parse_count("0"), 0)


    def test_whitespace(self):
        self.assertEqual(exercise.parse_count(" +3 "), 3)


    def test_negative(self):
        with self.assertRaises(ValueError):
            exercise.parse_count("-2")


    def test_invalid(self):
        for text in ("bad", "", "2.5"):
            with self.subTest(text=text), self.assertRaises(ValueError):
                exercise.parse_count(text)


class FinalTests(unittest.TestCase):
    def test_mixed(self):
        self.assertEqual(exercise.parse_counts(["2", "bad", "-1", " 0 "]), ([2, 0], [1, 2]))


    def test_empty(self):
        self.assertEqual(exercise.parse_counts([]), ([], []))


    def test_all_valid(self):
        self.assertEqual(exercise.parse_counts(["1", "+2"]), ([1, 2], []))


    def test_all_invalid(self):
        self.assertEqual(exercise.parse_counts(["", "bad", "-3"]), ([], [0, 1, 2]))


    def test_nonmutation(self):
        lines=["2", "x"]
        exercise.parse_counts(lines)
        self.assertEqual(lines, ["2", "x"])


    def test_unrelated_error(self):
        with mock.patch.object(exercise, "parse_count", side_effect=RuntimeError("unexpected")):
            with self.assertRaises(RuntimeError):
                exercise.parse_counts(["1"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
