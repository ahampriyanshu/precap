"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_inside(self):
        mapping={"x": 1}
        with exercise.temporary_value(mapping, "x", 2):
            self.assertEqual(mapping["x"], 2)


    def test_restore(self):
        mapping={"x": 1}
        with exercise.temporary_value(mapping, "x", 2): pass
        self.assertEqual(mapping, {"x": 1})


    def test_yield(self):
        mapping={"x": 1}
        with exercise.temporary_value(mapping, "x", 2) as result:
            self.assertIs(result, mapping)


    def test_exception(self):
        mapping={"x": 1}
        with self.assertRaises(ValueError):
            with exercise.temporary_value(mapping, "x", 2):
                raise ValueError("body")
        self.assertEqual(mapping["x"], 1)


    def test_none_value(self):
        mapping={"x": None}
        with exercise.temporary_value(mapping, "x", 0): pass
        self.assertIsNone(mapping["x"])


class FinalTests(unittest.TestCase):
    def test_existing(self):
        mapping={"mode": "light"}
        with exercise.temporary_setting(mapping, "mode", "dark") as result:
            self.assertIs(result, mapping)
            self.assertEqual(mapping["mode"], "dark")
        self.assertEqual(mapping["mode"], "light")


    def test_missing(self):
        mapping={}
        with exercise.temporary_setting(mapping, "x", 2):
            self.assertEqual(mapping["x"], 2)
        self.assertNotIn("x", mapping)


    def test_body_assignment(self):
        mapping={"x": 1}
        with exercise.temporary_setting(mapping, "x", 2):
            mapping["x"]=3
        self.assertEqual(mapping["x"], 1)


    def test_body_deletion(self):
        mapping={"x": 1}
        with exercise.temporary_setting(mapping, "x", 2):
            del mapping["x"]
        self.assertEqual(mapping["x"], 1)


    def test_unrelated(self):
        mapping={}
        with exercise.temporary_setting(mapping, "x", 2):
            mapping["y"]=9
        self.assertEqual(mapping, {"y": 9})


    def test_nested(self):
        mapping={"x": 1}
        with exercise.temporary_setting(mapping, "x", 2):
            with exercise.temporary_setting(mapping, "x", 3):
                self.assertEqual(mapping["x"], 3)
            self.assertEqual(mapping["x"], 2)
        self.assertEqual(mapping["x"], 1)


    def test_exception(self):
        mapping={}
        with self.assertRaisesRegex(RuntimeError, "body"):
            with exercise.temporary_setting(mapping, "x", None):
                raise RuntimeError("body")
        self.assertEqual(mapping, {})


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
