"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_multiply(self):
        self.assertEqual(exercise.make_multiplier(3)(4), 12)


    def test_zero(self):
        self.assertEqual(exercise.make_multiplier(0)(9), 0)


    def test_negative(self):
        self.assertEqual(exercise.make_multiplier(-2)(3), -6)


    def test_independent(self):
        double=exercise.make_multiplier(2)
        triple=exercise.make_multiplier(3)
        self.assertEqual((double(4), triple(4), double(5)), (8, 12, 10))


    def test_float(self):
        self.assertEqual(exercise.make_multiplier(0.5)(3), 1.5)


class FinalTests(unittest.TestCase):
    def test_initial(self):
        self.assertEqual(exercise.count_calls(abs).calls, 0)


    def test_result_and_count(self):
        wrapped=exercise.count_calls(abs)
        self.assertEqual(wrapped(-2), 2)
        self.assertEqual(wrapped(-3), 3)
        self.assertEqual(wrapped.calls, 2)


    def test_keywords(self):
        def combine(a, *, b): return a+b
        wrapped=exercise.count_calls(combine)
        self.assertEqual(wrapped(2, b=3), 5)
        self.assertEqual(wrapped.calls, 1)


    def test_error_counted(self):
        def fail(): raise ValueError("bad")
        wrapped=exercise.count_calls(fail)
        with self.assertRaisesRegex(ValueError, "bad"):
            wrapped()
        self.assertEqual(wrapped.calls, 1)


    def test_metadata(self):
        def named(value):
            """A useful description."""
            return value
        wrapped=exercise.count_calls(named)
        self.assertEqual(wrapped.__name__, named.__name__)
        self.assertEqual(wrapped.__doc__, named.__doc__)
        self.assertIs(wrapped.__wrapped__, named)


    def test_independent(self):
        a=exercise.count_calls(abs)
        b=exercise.count_calls(abs)
        a(-1)
        self.assertEqual((a.calls, b.calls), (1, 0))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
