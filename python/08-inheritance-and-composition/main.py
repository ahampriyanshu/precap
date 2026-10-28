"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_mixed(self):
        self.assertEqual(exercise.Lowercase().apply("AbC"), "abc")


    def test_empty(self):
        self.assertEqual(exercise.Lowercase().apply(""), "")


    def test_unchanged(self):
        self.assertEqual(exercise.Lowercase().apply("123 !"), "123 !")


    def test_unicode(self):
        self.assertEqual(exercise.Lowercase().apply("É"), "é")


    def test_repeat(self):
        operation=exercise.Lowercase()
        self.assertEqual(operation.apply("A"), "a")
        self.assertEqual(operation.apply("B"), "b")


class FinalTests(unittest.TestCase):
    def test_base(self):
        with self.assertRaises(NotImplementedError):
            exercise.TextOperation().apply("x")
        self.assertIsInstance(exercise.Strip(), exercise.TextOperation)
        self.assertIsInstance(exercise.Replace("x", "y"), exercise.TextOperation)


    def test_operations(self):
        self.assertEqual(exercise.Strip().apply(" x \n"), "x")
        self.assertEqual(exercise.Replace("a", "b").apply("a cat"), "b cbt")


    def test_order(self):
        pipeline=exercise.Pipeline([exercise.Strip(), exercise.Lowercase(), exercise.Replace("a", "x")])
        self.assertEqual(pipeline.apply(" A CAT "), "x cxt")


    def test_empty_pipeline(self):
        self.assertEqual(exercise.Pipeline([]).apply(" x "), " x ")


    def test_duck_typing(self):
        class Exclaim:
            def apply(self, text): return text+"!"
        self.assertEqual(exercise.Pipeline([Exclaim()]).apply("yes"), "yes!")


    def test_copy_sequence(self):
        operations=[exercise.Strip()]
        pipeline=exercise.Pipeline(operations)
        operations.append(exercise.Lowercase())
        self.assertEqual(pipeline.apply(" A "), "A")


    def test_replace_empty(self):
        self.assertEqual(exercise.Replace("", ".").apply("ab"), ".a.b.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
