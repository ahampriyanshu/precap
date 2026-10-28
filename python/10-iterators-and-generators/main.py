"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_totals(self):
        self.assertEqual(list(exercise.running_totals([2, -1, 4])), [2, 1, 5])


    def test_empty(self):
        self.assertEqual(list(exercise.running_totals([])), [])


    def test_zeros(self):
        self.assertEqual(list(exercise.running_totals([0, 0])), [0, 0])


    def test_iterator(self):
        result=exercise.running_totals(iter([1, 2]))
        self.assertIs(iter(result), result)
        self.assertEqual(next(result), 1)
        self.assertEqual(list(result), [3])


    def test_lazy(self):
        seen=[]
        def source():
            for n in range(3):
                seen.append(n)
                yield n
        result=exercise.running_totals(source())
        self.assertEqual(seen, [])
        self.assertEqual(next(result), 0)
        self.assertEqual(seen, [0])


class FinalTests(unittest.TestCase):
    def test_pieces(self):
        self.assertEqual(list(exercise.batches(range(5), 2)), [[0, 1], [2, 3], [4]])


    def test_empty(self):
        self.assertEqual(list(exercise.batches([], 3)), [])


    def test_exact(self):
        self.assertEqual(list(exercise.batches([1, 2, 3, 4], 2)), [[1, 2], [3, 4]])


    def test_single(self):
        self.assertEqual(list(exercise.batches(iter([1, 2]), 1)), [[1], [2]])


    def test_invalid_size(self):
        for size in (0, -2):
            with self.subTest(size=size), self.assertRaises(ValueError):
                list(exercise.batches([], size))


    def test_lazy(self):
        seen=[]
        def source():
            for n in range(6):
                seen.append(n)
                yield n
        result=exercise.batches(source(), 2)
        self.assertIs(iter(result), result)
        self.assertEqual(seen, [])
        self.assertEqual(next(result), [0, 1])
        self.assertEqual(seen, [0, 1])


    def test_fresh_batches(self):
        result=list(exercise.batches(range(4), 2))
        result[0].append(9)
        self.assertEqual(result[1], [2, 3])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
