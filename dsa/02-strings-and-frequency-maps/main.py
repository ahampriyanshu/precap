"""Executable specification. Run --stage prototype or --stage final."""
from __future__ import annotations
import argparse
import copy
import unittest
import exercise

STAGE = 'final'

CASES = [('multiplicity beats sets', ('ab', 'aaa'), {'a': 2}),
 ('case and punctuation', ('A-b 2', 'BAAA!'), {'a': 2}),
 ('empty strings', ('', ''), {}),
 ('unicode letters', ('éÉ', 'ééé'), {'é': 1}),
 ('casefold expansion', ('ß', 'SS'), {}),
 ('generated text 0', ('', ' a?A'), {'a': 2}),
 ('generated text 1', ('C', 'A AbB'), {'a': 2, 'b': 2}),
 ('generated text 2', ('!a', '?  ?BB'), {'b': 2}),
 ('generated text 3', ('c b', '?B abbb'), {'a': 1, 'b': 3}),
 ('generated text 4', ('AAAa', ' BBa??AB'), {'b': 3}),
 ('generated text 5', (' !aca', '??AAbA c?'), {'a': 1, 'b': 1}),
 ('generated text 6', ('bcaaaB', 'ABAbcBbAaA'), {'a': 2, 'b': 2}),
 ('generated text 7', ('C!BbA C', '?cbBbbaA ?A'), {'a': 2, 'b': 2}),
 ('generated text 8', ('Cb!aBabA', ' b?bb abbba?'), {'b': 3}),
 ('generated text 9', ('A!cAaC!aC', 'ba?aB?Ba?A BB'), {'b': 5}),
 ('generated text 10', (' cB!cbBB c', ' bacAc?? Baaac'), {'a': 5}),
 ('generated text 11', ('!baBBBabaa!', '  BA?BA cBAaAbA'), {'a': 2, 'c': 1}),
 ('generated text 12', ('bB!bCbAAbbCc', ' bAAaABA a  BcBA'), {'a': 5}),
 ('generated text 13', ('cCc!ba!bcbAcB', 'aB?AA  b Babc aaB'), {'a': 4, 'b': 1}),
 ('generated text 14', ('ABAaBaBaBCcCb!', 'A ABcB ?A?c?BAc b?'), {})]

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
