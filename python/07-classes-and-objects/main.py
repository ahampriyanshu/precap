"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_attribute(self):
        self.assertEqual(exercise.Note("hello").text, "hello")


    def test_preview(self):
        self.assertEqual(exercise.Note("hello").preview(3), "hel")


    def test_zero(self):
        self.assertEqual(exercise.Note("hello").preview(0), "")


    def test_long_limit(self):
        self.assertEqual(exercise.Note("hi").preview(10), "hi")


    def test_empty(self):
        self.assertEqual(exercise.Note("").preview(2), "")


class FinalTests(unittest.TestCase):
    def test_empty(self):
        book=exercise.Notebook()
        self.assertEqual(book.all_notes(), [])
        self.assertEqual(book.find("x"), [])


    def test_add(self):
        book=exercise.Notebook()
        self.assertIsNone(book.add("first"))
        book.add("second")
        self.assertEqual(book.all_notes(), ["first", "second"])


    def test_find(self):
        book=exercise.Notebook()
        for text in ["Python", "python", "Python"]:
            book.add(text)
        self.assertEqual(book.find("Py"), ["Python", "Python"])


    def test_empty_term(self):
        book=exercise.Notebook()
        book.add("")
        book.add("x")
        self.assertEqual(book.find(""), ["", "x"])


    def test_snapshot(self):
        book=exercise.Notebook()
        book.add("x")
        book.all_notes().append("bad")
        book.find("x").clear()
        self.assertEqual(book.all_notes(), ["x"])


    def test_independent(self):
        a=exercise.Notebook()
        b=exercise.Notebook()
        a.add("x")
        self.assertEqual(b.all_notes(), [])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
