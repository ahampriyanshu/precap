"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_diameter(self):
        self.assertEqual(exercise.Circle(3).diameter, 6)


    def test_zero(self):
        self.assertEqual(exercise.Circle(0).diameter, 0)


    def test_float(self):
        self.assertEqual(exercise.Circle(1.5).diameter, 3.0)


    def test_recomputed(self):
        circle=exercise.Circle(2)
        circle.radius=4
        self.assertEqual(circle.diameter, 8)


    def test_read_only(self):
        with self.assertRaises(AttributeError):
            exercise.Circle(2).diameter=9


class FinalTests(unittest.TestCase):
    def test_freezing(self):
        self.assertEqual(exercise.Temperature(0).fahrenheit, 32)


    def test_boiling(self):
        self.assertEqual(exercise.Temperature(100).fahrenheit, 212)


    def test_setter(self):
        temperature=exercise.Temperature(10)
        temperature.celsius=20
        self.assertEqual(temperature.celsius, 20)
        self.assertEqual(temperature.fahrenheit, 68)


    def test_boundary(self):
        self.assertEqual(exercise.Temperature(-273.15).celsius, -273.15)


    def test_invalid_initial(self):
        with self.assertRaises(ValueError):
            exercise.Temperature(-274)


    def test_invalid_preserves(self):
        temperature=exercise.Temperature(10)
        with self.assertRaises(ValueError):
            temperature.celsius=-1000
        self.assertEqual(temperature.celsius, 10)


    def test_independent_and_read_only(self):
        a=exercise.Temperature(0)
        b=exercise.Temperature(100)
        a.celsius=10
        self.assertEqual(b.celsius, 100)
        with self.assertRaises(AttributeError):
            a.fahrenheit=9


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
