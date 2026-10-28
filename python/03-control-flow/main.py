"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(exercise.count_positive([]), 0)


    def test_mixed(self):
        self.assertEqual(exercise.count_positive([1, -1, 0, 4]), 2)


    def test_all_negative(self):
        self.assertEqual(exercise.count_positive([-2, -3]), 0)


    def test_zero(self):
        self.assertEqual(exercise.count_positive([0, 0]), 0)


    def test_nonmutation(self):
        values=[1, 2]
        self.assertEqual(exercise.count_positive(values), 2)
        self.assertEqual(values, [1, 2])


class FinalTests(unittest.TestCase):
    def test_exact(self):
        self.assertEqual(exercise.first_total_at_least([2, 3, 1], 5), 1)


    def test_overshoot(self):
        self.assertEqual(exercise.first_total_at_least([2, 8], 5), 1)


    def test_negative_values(self):
        self.assertEqual(exercise.first_total_at_least([2, -4, 7], 5), 2)


    def test_none(self):
        self.assertIsNone(exercise.first_total_at_least([1, 2], 4))


    def test_empty(self):
        self.assertIsNone(exercise.first_total_at_least([], 0))


    def test_first_prefix(self):
        self.assertEqual(exercise.first_total_at_least([0, 9], 0), 0)
        self.assertEqual(exercise.first_total_at_least([-5, -1], -6), 0)


    def test_nonmutation(self):
        values=[1, 2, 3]
        exercise.first_total_at_least(values, 3)
        self.assertEqual(values, [1, 2, 3])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
