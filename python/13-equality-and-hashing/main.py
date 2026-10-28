"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_case(self):
        self.assertTrue(exercise.same_label("Ada", "ADA"))


    def test_space(self):
        self.assertTrue(exercise.same_label(" a ", "a"))


    def test_unicode(self):
        self.assertTrue(exercise.same_label("Straße", "STRASSE"))


    def test_different(self):
        self.assertFalse(exercise.same_label("a", "b"))


    def test_empty(self):
        self.assertTrue(exercise.same_label(" ", ""))


class FinalTests(unittest.TestCase):
    def test_normalized(self):
        key=exercise.UserKey(" Ada ", "EXAMPLE.COM")
        self.assertEqual((key.name, key.domain), ("ada", "example.com"))


    def test_equality(self):
        self.assertEqual(exercise.UserKey("A", "D"), exercise.UserKey(" a ", "d"))


    def test_different_fields(self):
        self.assertNotEqual(exercise.UserKey("a", "d"), exercise.UserKey("b", "d"))
        self.assertNotEqual(exercise.UserKey("a", "d"), exercise.UserKey("a", "e"))


    def test_hash_lookup(self):
        a=exercise.UserKey("A", "D")
        b=exercise.UserKey("a", "d")
        self.assertEqual(hash(a), hash(b))
        self.assertEqual({a: 7}[b], 7)
        self.assertEqual(len({a, b}), 1)


    def test_immutable(self):
        key=exercise.UserKey("a", "d")
        with self.assertRaises((AttributeError, TypeError)):
            key.name="other"


    def test_unsupported(self):
        key=exercise.UserKey("a", "d")
        self.assertIs(key.__eq__(("a", "d")), NotImplemented)
        self.assertNotEqual(key, ("a", "d"))


    def test_empty_unicode(self):
        self.assertEqual(exercise.UserKey("Straße", " "), exercise.UserKey("STRASSE", ""))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
