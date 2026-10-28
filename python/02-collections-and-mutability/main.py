"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(exercise.unique_words([]), [])


    def test_duplicates(self):
        self.assertEqual(exercise.unique_words(["a", "b", "a"]), ["a", "b"])


    def test_order(self):
        self.assertEqual(exercise.unique_words(["z", "a", "z", "b"]), ["z", "a", "b"])


    def test_case(self):
        self.assertEqual(exercise.unique_words(["A", "a", ""]), ["A", "a", ""])


    def test_nonmutation(self):
        words=["x", "x"]
        result=exercise.unique_words(words)
        self.assertEqual(words, ["x", "x"])
        self.assertIsNot(result, words)


class FinalTests(unittest.TestCase):
    def test_group(self):
        self.assertEqual(exercise.group_words(["ant", "bee", "apple"]), {"a": ["ant", "apple"], "b": ["bee"]})


    def test_empty(self):
        self.assertEqual(exercise.group_words([]), {})


    def test_skip_empty(self):
        self.assertEqual(exercise.group_words(["", "", "ant"]), {"a": ["ant"]})


    def test_duplicates(self):
        self.assertEqual(exercise.group_words(["ant", "ant"]), {"a": ["ant", "ant"]})


    def test_case_and_space(self):
        self.assertEqual(exercise.group_words(["Ant", "ant", " x"]), {"A": ["Ant"], "a": ["ant"], " ": [" x"]})


    def test_independent(self):
        words=["ant", "bee"]
        a=exercise.group_words(words)
        b=exercise.group_words(words)
        a["a"].append("added")
        self.assertEqual(b["a"], ["ant"])
        self.assertEqual(words, ["ant", "bee"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
