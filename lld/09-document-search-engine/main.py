"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise

class PrototypeTests(unittest.TestCase):
    def test_case_punctuation_and_digits(self):
        self.assertEqual(exercise.tokenize('Red, BLUE-blue! 42 x_y'), ['red', 'blue', 'blue', '42', 'x', 'y'])

    def test_empty_and_non_ascii(self):
        self.assertEqual(exercise.tokenize(' ... '), [])
        self.assertEqual(exercise.tokenize(''), [])
        self.assertEqual(exercise.tokenize('café 東京'), ['caf'])

    def test_duplicate_order_and_fresh_list(self):
        row = exercise.tokenize('b a b'); row.clear()
        self.assertEqual(exercise.tokenize('b a b'), ['b', 'a', 'b'])

class FinalTests(unittest.TestCase):
    def test_lifecycle_duplicates_and_stats(self):
        e = exercise.SearchEngine()
        self.assertEqual(e.stats(), (0, 0))
        self.assertIsNone(e.get('missing'))
        self.assertTrue(e.add('a', ' Red, blue BLUE! '))
        self.assertFalse(e.add('a', 'replacement'))
        self.assertEqual(e.get('a'), ' Red, blue BLUE! ')
        self.assertEqual(e.stats(), (1, 3))
        self.assertTrue(e.add('empty', '...'))
        self.assertEqual(e.stats(), (2, 3))

    def test_term_frequency_ties_and_whole_token_matching(self):
        e = exercise.SearchEngine()
        for name, text in [('z', 'RED red'), ('a', 'red red'), ('b', 'red'), ('c', 'credit')]: e.add(name, text)
        self.assertEqual(e.search('RED'), [('a', 2), ('z', 2), ('b', 1)])
        self.assertEqual(e.search('red!'), [('a', 2), ('z', 2), ('b', 1)])
        self.assertEqual(e.search('missing'), [])
        self.assertEqual(e.search('red', 2), [('a', 2), ('z', 2)])

    def test_phrase_order_and_punctuation(self):
        e = exercise.SearchEngine()
        e.add('a', 'Red, fox red fox'); e.add('b', 'red slow fox'); e.add('c', 'fox red')
        self.assertEqual(e.search_phrase('RED FOX'), [('a', 2)])
        self.assertEqual(e.search_phrase('fox red'), [('a', 1), ('c', 1)])
        self.assertEqual(e.search_phrase('red,fox'), [('a', 2)])
        self.assertEqual(e.search_phrase('fox missing'), [])

    def test_phrase_repeated_tokens_and_overlaps(self):
        e = exercise.SearchEngine()
        e.add('z', 'ha ha'); e.add('a', 'ha ha ha'); e.add('b', 'ha x ha')
        self.assertEqual(e.search_phrase('ha ha'), [('a', 2), ('z', 1)])
        self.assertEqual(e.search_phrase('ha ha ha'), [('a', 1)])
        self.assertEqual(e.search_phrase('ha'), e.search('ha'))

    def test_update_removes_stale_terms_positions_and_counts(self):
        e = exercise.SearchEngine()
        e.add('a', 'red fox red'); e.add('b', 'red')
        self.assertTrue(e.update('a', 'blue fox'))
        self.assertEqual(e.search('red'), [('b', 1)])
        self.assertEqual(e.search('blue'), [('a', 1)])
        self.assertEqual(e.search_phrase('red fox'), [])
        self.assertEqual(e.search_phrase('blue fox'), [('a', 1)])
        self.assertEqual(e.stats(), (2, 3))
        self.assertEqual(e.get('a'), 'blue fox')
        self.assertTrue(e.update('a', ''))
        self.assertEqual(e.search('fox'), [])
        self.assertEqual(e.stats(), (2, 1))

    def test_delete_and_identifier_reuse_do_not_revive_postings(self):
        e = exercise.SearchEngine()
        e.add('a', 'old old term')
        self.assertTrue(e.delete('a'))
        self.assertFalse(e.delete('a'))
        self.assertIsNone(e.get('a'))
        self.assertEqual(e.search('old'), [])
        self.assertEqual(e.stats(), (0, 0))
        self.assertTrue(e.add('a', 'new'))
        self.assertEqual(e.search('old'), [])
        self.assertEqual(e.search_phrase('old term'), [])
        self.assertEqual(e.search('new'), [('a', 1)])
        self.assertEqual(e.stats(), (1, 1))

    def test_failed_update_delete_duplicate_preserve_state(self):
        e = exercise.SearchEngine(); e.add('a', 'one two')
        self.assertFalse(e.update('missing', 'one one'))
        self.assertFalse(e.delete('missing'))
        self.assertFalse(e.add('a', 'wrong'))
        self.assertEqual(e.get('a'), 'one two')
        self.assertEqual(e.stats(), (1, 2))
        self.assertEqual(e.search('one'), [('a', 1)])
        self.assertEqual(e.search('wrong'), [])

    def test_empty_phrase_query_validation_and_limits(self):
        e = exercise.SearchEngine(); e.add('a', 'red')
        self.assertEqual(e.search_phrase('...'), [])
        self.assertEqual(e.search_phrase(''), [])
        self.assertEqual(e.search('red', 0), [])
        self.assertEqual(e.search_phrase('red', 0), [])
        for text in ('', '...', 'red blue'):
            with self.assertRaises(ValueError): e.search(text)
            with self.assertRaises(ValueError): e.search(text, 0)
        with self.assertRaises(ValueError): e.search('red', -1)
        with self.assertRaises(ValueError): e.search_phrase('', -1)
        self.assertEqual(e.stats(), (1, 1))
        self.assertEqual(e.search('red'), [('a', 1)])

    def test_ascii_tokenization_separators_and_numbers(self):
        e = exercise.SearchEngine(); e.add('a', 'x_y café 42 42')
        self.assertEqual(e.search('42'), [('a', 2)])
        self.assertEqual(e.search_phrase('x y caf'), [('a', 1)])
        self.assertEqual(e.stats(), (1, 5))

    def test_default_limit_and_deterministic_tie_order(self):
        e = exercise.SearchEngine()
        for i in range(12): e.add(f'd{i:02}', 'x')
        expected = [(f'd{i:02}', 1) for i in range(10)]
        self.assertEqual(e.search('x'), expected)
        self.assertEqual(e.search_phrase('x'), expected)
        self.assertEqual(len(e.search('x', 99)), 12)

    def test_result_snapshots_and_instance_isolation(self):
        a, b = exercise.SearchEngine(), exercise.SearchEngine()
        a.add('a', 'x x')
        a.search('x').clear(); a.search_phrase('x').append(('fake', 10))
        self.assertEqual(a.search('x'), [('a', 2)])
        self.assertEqual(b.stats(), (0, 0))
        self.assertEqual(b.search('x'), [])
        b.add('a', 'y')
        self.assertEqual(a.get('a'), 'x x')


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
