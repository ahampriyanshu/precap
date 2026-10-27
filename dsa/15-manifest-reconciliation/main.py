"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('three different edits', ('kitten', 'sitting'), 3),
 ('no transposition shortcut', ('ab', 'ba'), 2),
 ('empty boundary', ('', 'abc'), 3),
 ('no normalization', ('é', 'e'), 1),
 ('reconcile 0', ('', 'abacca'), 6),
 ('reconcile 1', ('c', 'bcabbb'), 5),
 ('reconcile 2', ('ac', 'bcabca'), 4),
 ('reconcile 3', ('aca', 'cbbcab'), 4),
 ('reconcile 4', ('babb', 'cbaaba'), 3),
 ('reconcile 5', ('baccc', 'abcbcb'), 4),
 ('reconcile 6', ('baccbc', 'baabba'), 3),
 ('reconcile 7', ('aabbcba', 'cbaaaa'), 5),
 ('reconcile 8', ('bbbbabba', 'bcaccc'), 6),
 ('reconcile 9', ('acaabbbbb', 'ababbc'), 5),
 ('reconcile 10', ('ccbbcccbbc', 'bccaca'), 7),
 ('reconcile 11', ('aababcabbcc', 'bccbcc'), 6),
 ('reconcile 12', ('cababbaabccc', 'bbaaba'), 7)]

ERROR_CASES = []

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
