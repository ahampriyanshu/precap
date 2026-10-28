"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_default(self):
        self.assertEqual(exercise.scale(4), 8)


    def test_positional(self):
        self.assertEqual(exercise.scale(4, 3), 12)


    def test_keyword(self):
        self.assertEqual(exercise.scale(4, factor=0), 0)


    def test_negative(self):
        self.assertEqual(exercise.scale(-2), -4)


    def test_float(self):
        self.assertEqual(exercise.scale(1.5), 3.0)


class FinalTests(unittest.TestCase):
    def test_map(self):
        self.assertEqual(exercise.transform_values([1, 2], lambda n: n*3), [3, 6])


    def test_filter_first(self):
        self.assertEqual(exercise.transform_values([0, 2], lambda n: 10/n, keep=lambda n: n != 0), [5])


    def test_empty(self):
        self.assertEqual(exercise.transform_values([], lambda n: n), [])


    def test_order_and_calls(self):
        seen=[]
        result=exercise.transform_values([3, 1, 3], lambda n: seen.append(n) or n+1)
        self.assertEqual(result, [4, 2, 4])
        self.assertEqual(seen, [3, 1, 3])


    def test_nonmutation(self):
        values=[1, 2]
        result=exercise.transform_values(values, lambda n: n)
        self.assertIsNot(values, result)
        self.assertEqual(values, [1, 2])


    def test_exceptions(self):
        def fail(n):
            raise RuntimeError("callback")
        with self.assertRaisesRegex(RuntimeError, "callback"):
            exercise.transform_values([1], fail)


    def test_keyword_only(self):
        with self.assertRaises(TypeError):
            exercise.transform_values([1], abs, bool)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
