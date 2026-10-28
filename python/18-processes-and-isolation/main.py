"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise
import os

STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_square(self):
        self.assertEqual(exercise.square_with_pid(3)[0], 9)


    def test_negative(self):
        self.assertEqual(exercise.square_with_pid(-2)[0], 4)


    def test_zero(self):
        self.assertEqual(exercise.square_with_pid(0)[0], 0)


    def test_pid(self):
        self.assertEqual(exercise.square_with_pid(1)[1], os.getpid())


    def test_large_integer(self):
        self.assertEqual(exercise.square_with_pid(10**12)[0], 10**24)


class FinalTests(unittest.TestCase):
    def test_ordered(self):
        result=exercise.process_squares([3, 1, -2])
        self.assertEqual([value for value, pid in result], [9, 1, 4])


    def test_child_processes(self):
        result=exercise.process_squares([1, 2], workers=1)
        self.assertTrue(all(isinstance(pid, int) and pid != os.getpid() for value, pid in result))


    def test_empty(self):
        self.assertEqual(exercise.process_squares([]), [])


    def test_duplicates_and_zero(self):
        result=exercise.process_squares([0, 2, 2], workers=1)
        self.assertEqual([value for value, pid in result], [0, 4, 4])


    def test_invalid_workers(self):
        for workers in (0, -1):
            with self.subTest(workers=workers), self.assertRaises(ValueError):
                exercise.process_squares([], workers=workers)


    def test_nonmutation(self):
        values=[2, -1]
        exercise.process_squares(values, workers=1)
        self.assertEqual(values, [2, -1])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
