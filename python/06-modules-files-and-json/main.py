"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise
import json
import tempfile
from pathlib import Path

STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_names(self):
        self.assertEqual(exercise.decode_names('["Ada", "Lin"]'), ["Ada", "Lin"])


    def test_empty(self):
        self.assertEqual(exercise.decode_names("[]"), [])


    def test_unicode(self):
        self.assertEqual(exercise.decode_names('["李"]'), ["李"])


    def test_invalid_json(self):
        with self.assertRaises(ValueError):
            exercise.decode_names("[")


    def test_shape(self):
        for text in ("null", "{}", '[1, "a"]'):
            with self.subTest(text=text), self.assertRaises(ValueError):
                exercise.decode_names(text)


class FinalTests(unittest.TestCase):
    def test_round_trip(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/"names.json"
            self.assertIsNone(exercise.save_names(path, ["Ada", "李"]))
            self.assertEqual(exercise.load_names(path), ["Ada", "李"])


    def test_empty(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/"empty.json"
            exercise.save_names(str(path), [])
            self.assertEqual(exercise.load_names(str(path)), [])


    def test_replace(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/"names.json"
            path.write_text("old content", encoding="utf-8")
            exercise.save_names(path, ["new"])
            self.assertEqual(json.loads(path.read_text(encoding="utf-8")), ["new"])


    def test_missing(self):
        with tempfile.TemporaryDirectory() as folder:
            with self.assertRaises(FileNotFoundError):
                exercise.load_names(Path(folder)/"missing")


    def test_bad_file(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/"bad.json"
            for content in ("[", "{}", "[1]"):
                path.write_text(content, encoding="utf-8")
                with self.assertRaises(ValueError):
                    exercise.load_names(path)


    def test_nonmutation(self):
        with tempfile.TemporaryDirectory() as folder:
            names=["b", "a"]
            exercise.save_names(Path(folder)/"names.json", names)
            self.assertEqual(names, ["b", "a"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
