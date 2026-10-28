"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('duplicate removal', (['food', 'food', 'water', 'fuel', 'water'], 2), 3),
 ('empty', ([], 2), 0),
 ('no kinds allowed', (['a'], 0), 0),
 ('window n=1 k=0', (['b'], 0), 0),
 ('window n=1 k=1', (['c'], 1), 1),
 ('window n=1 k=2', (['b'], 2), 1),
 ('window n=1 k=3', (['c'], 3), 1),
 ('window n=2 k=0', (['a', 'a'], 0), 0),
 ('window n=2 k=1', (['a', 'b'], 1), 1),
 ('window n=2 k=2', (['a', 'a'], 2), 2),
 ('window n=2 k=3', (['a', 'b'], 3), 2),
 ('window n=3 k=0', (['b', 'a', 'a'], 0), 0),
 ('window n=3 k=1', (['a', 'c', 'a'], 1), 1),
 ('window n=3 k=2', (['c', 'c', 'c'], 2), 3),
 ('window n=3 k=3', (['c', 'a', 'c'], 3), 3),
 ('window n=4 k=0', (['b', 'c', 'a', 'a'], 0), 0),
 ('window n=4 k=1', (['b', 'c', 'c', 'a'], 1), 2),
 ('window n=4 k=2', (['a', 'c', 'c', 'b'], 2), 3),
 ('window n=4 k=3', (['c', 'b', 'c', 'c'], 3), 4),
 ('window n=5 k=0', (['c', 'a', 'c', 'c', 'c'], 0), 0),
 ('window n=5 k=1', (['b', 'a', 'b', 'a', 'a'], 1), 2),
 ('window n=5 k=2', (['a', 'a', 'b', 'b', 'c'], 2), 4),
 ('window n=5 k=3', (['a', 'b', 'b', 'a', 'a'], 3), 5),
 ('window n=6 k=0', (['b', 'a', 'b', 'b', 'c', 'a'], 0), 0),
 ('window n=6 k=1', (['c', 'a', 'c', 'a', 'a', 'a'], 1), 3),
 ('window n=6 k=2', (['a', 'a', 'b', 'a', 'b', 'b'], 2), 6),
 ('window n=6 k=3', (['b', 'a', 'b', 'b', 'b', 'a'], 3), 6),
 ('window n=7 k=0', (['a', 'c', 'a', 'b', 'b', 'a', 'a'], 0), 0),
 ('window n=7 k=1', (['b', 'b', 'b', 'b', 'c', 'c', 'c'], 1), 4),
 ('window n=7 k=2', (['b', 'b', 'a', 'a', 'c', 'b', 'c'], 2), 4),
 ('window n=7 k=3', (['b', 'a', 'a', 'c', 'b', 'c', 'c'], 3), 7),
 ('window n=8 k=0', (['a', 'c', 'c', 'a', 'c', 'a', 'a', 'c'], 0), 0),
 ('window n=8 k=1', (['b', 'a', 'c', 'b', 'c', 'b', 'a', 'c'], 1), 1),
 ('window n=8 k=2', (['c', 'a', 'a', 'c', 'a', 'b', 'a', 'c'], 2), 5),
 ('window n=8 k=3', (['b', 'a', 'c', 'c', 'c', 'a', 'a', 'b'], 3), 8),
 ('window n=9 k=0', (['b', 'c', 'b', 'c', 'a', 'c', 'a', 'b', 'b'], 0), 0),
 ('window n=9 k=1', (['a', 'b', 'c', 'a', 'a', 'b', 'a', 'b', 'b'], 1), 2),
 ('window n=9 k=2', (['a', 'b', 'b', 'b', 'c', 'c', 'a', 'c', 'b'], 2), 5),
 ('window n=9 k=3', (['c', 'a', 'b', 'a', 'b', 'b', 'c', 'b', 'c'], 3), 9),
 ('window n=10 k=0', (['b', 'c', 'b', 'a', 'c', 'a', 'b', 'a', 'a', 'c'], 0), 0),
 ('window n=10 k=1', (['a', 'b', 'a', 'b', 'c', 'c', 'c', 'a', 'b', 'c'], 1), 3),
 ('window n=10 k=2', (['a', 'b', 'c', 'c', 'c', 'b', 'a', 'c', 'c', 'b'], 2), 5),
 ('window n=10 k=3', (['a', 'a', 'b', 'a', 'c', 'c', 'c', 'c', 'c', 'b'], 3), 10),
 ('window n=11 k=0', (['b', 'a', 'c', 'c', 'c', 'c', 'c', 'c', 'a', 'c', 'a'], 0), 0),
 ('window n=11 k=1', (['a', 'b', 'b', 'b', 'a', 'a', 'b', 'b', 'b', 'c', 'c'], 1), 3),
 ('window n=11 k=2', (['c', 'b', 'c', 'c', 'a', 'b', 'c', 'b', 'b', 'a', 'b'], 2), 4),
 ('window n=11 k=3', (['a', 'a', 'b', 'c', 'a', 'c', 'c', 'c', 'c', 'c', 'b'], 3), 11)]

ERROR_CASES = [('negative limit', (['a'], -1))]

FINAL_CASES = []
class ContractTests(unittest.TestCase):
    def invoke(self, args):
        fn = exercise.prototype if STAGE == 'prototype' else exercise.solve
        before = copy.deepcopy(args)
        try:
            return fn(*args)
        finally:
            self.assertEqual(args, before, 'Do not mutate caller-owned inputs, including on failure')

    def assert_typed_equal(self, actual, expected):
        self.assertIs(type(actual),type(expected),'Return the exact documented value type')
        self.assertEqual(actual,expected)
        if isinstance(expected,(list,tuple)):
            for left,right in zip(actual,expected):self.assert_typed_equal(left,right)
        elif isinstance(expected,dict):
            self.assertEqual(list(actual),list(expected),'Dictionary key order is part of this contract')
            for key in expected:self.assert_typed_equal(actual[key],expected[key])

    def test_examples_boundaries_and_counterexamples(self):
        for name, args, expected in CASES:
            with self.subTest(case=name):
                self.assert_typed_equal(self.invoke(copy.deepcopy(args)), expected)

    def test_explicit_error_contract(self):
        for name, args in ERROR_CASES:
            with self.subTest(case=name):
                with self.assertRaises(ValueError):
                    self.invoke(copy.deepcopy(args))

    def test_final_scale_cases(self):
        if STAGE == 'prototype':
            return  # These cases are deliberately outside the prototype's scale.
        for name, args, expected in FINAL_CASES:
            with self.subTest(case=name):
                self.assert_typed_equal(self.invoke(copy.deepcopy(args)), expected)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--stage', choices=['prototype', 'final'], default='final')
    options, remaining = parser.parse_known_args()
    STAGE = options.stage
    unittest.main(argv=['main.py', *remaining], verbosity=2)
