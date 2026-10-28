"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


class PrototypeTests(unittest.TestCase):
    def test_upload_and_get(self):
        c = exercise.FileCatalog()
        self.assertIsNone(c.get('missing'))
        self.assertTrue(c.upload('a', 0))
        self.assertEqual(c.get('a'), 0)
        self.assertFalse(c.upload('a', 9))
        self.assertEqual(c.get('a'), 0)

    def test_validation_preserves_catalog(self):
        c = exercise.FileCatalog()
        for name, size in [('', 3), ('x', -1)]:
            with self.assertRaises(ValueError):
                c.upload(name, size)
        self.assertIsNone(c.get('x'))
        self.assertTrue(c.upload('x', 3))

    def test_independent_case_sensitive_names(self):
        a, b = exercise.FileCatalog(), exercise.FileCatalog()
        a.upload('a', 4)
        a.upload('A', 5)
        self.assertEqual(a.get('a'), 4)
        self.assertEqual(a.get('A'), 5)
        self.assertIsNone(b.get('a'))


class FinalTests(unittest.TestCase):
    def test_quota_boundary_and_failed_upload(self):
        s = exercise.FileStorage(10)
        self.assertTrue(s.upload('a', 4))
        self.assertTrue(s.upload('b', 6))
        self.assertFalse(s.upload('c', 1))
        self.assertEqual(s.usage(), 10)
        self.assertIsNone(s.get('c'))
        self.assertEqual(s.get('a'), {'name': 'a', 'size': 4, 'expires_at': None})

    def test_duplicates_do_not_overwrite_or_charge(self):
        s = exercise.FileStorage(10)
        s.upload('a', 4, 3)
        self.assertFalse(s.upload('a', 2))
        self.assertEqual(s.get('a')['size'], 4)
        self.assertEqual(s.get('a')['expires_at'], 3)
        self.assertEqual(s.usage(), 4)

    def test_expiration_is_exact_and_releases_quota(self):
        s = exercise.FileStorage(5)
        s.upload('a', 5, 3)
        self.assertIsNone(s.advance_to(2))
        self.assertIsNotNone(s.get('a'))
        self.assertFalse(s.upload('b', 1))
        s.advance_to(3)
        self.assertIsNone(s.get('a'))
        self.assertEqual(s.search(''), [])
        self.assertEqual(s.usage(), 0)
        self.assertTrue(s.upload('b', 5))
        s.advance_to(100)
        self.assertEqual(s.usage(), 5)

    def test_copy_preserves_absolute_expiry(self):
        s = exercise.FileStorage(10)
        s.upload('a', 4, 5)
        s.advance_to(3)
        self.assertTrue(s.copy('a', 'b'))
        self.assertEqual(s.get('b'), {'name': 'b', 'size': 4, 'expires_at': 5})
        self.assertEqual(s.usage(), 8)
        s.advance_to(5)
        self.assertIsNone(s.get('a'))
        self.assertIsNone(s.get('b'))
        self.assertEqual(s.usage(), 0)

    def test_failed_copies_preserve_entries_and_usage(self):
        s = exercise.FileStorage(7)
        s.upload('a', 4)
        s.upload('b', 2)
        before = s.search('')
        for source, destination in [('missing', 'c'), ('a', 'a'), ('a', 'b'), ('a', 'c')]:
            self.assertFalse(s.copy(source, destination))
        self.assertEqual(s.search(''), before)
        self.assertEqual(s.usage(), 6)

    def test_delete_and_repeated_deletion(self):
        s = exercise.FileStorage(4)
        s.upload('a', 4, 3)
        self.assertTrue(s.delete('a'))
        self.assertFalse(s.delete('a'))
        self.assertFalse(s.delete('missing'))
        self.assertEqual(s.usage(), 0)
        s.advance_to(3)
        self.assertEqual(s.usage(), 0)
        self.assertTrue(s.upload('a', 4))

    def test_search_order_prefix_case_and_limit(self):
        s = exercise.FileStorage(100)
        for name, size in [('p/z', 8), ('p/b', 8), ('p/a', 2), ('P/a', 9), ('q', 10)]:
            s.upload(name, size)
        self.assertEqual([r['name'] for r in s.search('p/', 2)], ['p/b', 'p/z'])
        self.assertEqual([r['name'] for r in s.search('')], ['q', 'P/a', 'p/b', 'p/z', 'p/a'])
        self.assertEqual(s.search('none'), [])
        self.assertEqual(s.search('', 0), [])

    def test_default_search_limit(self):
        s = exercise.FileStorage(100)
        for number in range(12):
            s.upload(f'f{number:02}', number)
        self.assertEqual(len(s.search('f')), 10)
        self.assertEqual(s.search('f')[0]['name'], 'f11')
        self.assertEqual(len(s.search('f', 20)), 12)

    def test_validation_and_clock_failures_preserve_state(self):
        s = exercise.FileStorage(10)
        s.upload('a', 2, 5)
        s.advance_to(2)
        before = s.search('')
        for args in [('', 2), ('x', -1), ('x', 2, 0), ('a', 1, -1)]:
            with self.assertRaises(ValueError):
                s.upload(*args)
        with self.assertRaises(ValueError):
            s.copy('missing', '')
        with self.assertRaises(ValueError):
            s.search('', -1)
        with self.assertRaises(ValueError):
            s.advance_to(1)
        self.assertEqual(s.search(''), before)
        self.assertEqual(s.usage(), 2)
        s.upload('b', 1, 1)
        self.assertEqual(s.get('b')['expires_at'], 3)
        s.advance_to(2)
        self.assertIsNotNone(s.get('b'))

    def test_zero_quota_and_invalid_constructor(self):
        with self.assertRaises(ValueError):
            exercise.FileStorage(-1)
        s = exercise.FileStorage(0)
        with self.assertRaises(ValueError):
            s.advance_to(-1)
        self.assertTrue(s.upload('a', 0))
        self.assertTrue(s.copy('a', 'b'))
        self.assertFalse(s.upload('c', 1))
        self.assertEqual(s.usage(), 0)
        self.assertEqual(len(s.search('')), 2)

    def test_fresh_snapshots_and_independent_instances(self):
        a, b = exercise.FileStorage(10), exercise.FileStorage(10)
        a.upload('x', 3)
        a.get('x')['size'] = 99
        result = a.search('')
        result[0]['name'] = 'bad'
        result.clear()
        self.assertEqual(a.get('x')['size'], 3)
        self.assertEqual(a.search('')[0]['name'], 'x')
        self.assertEqual(b.usage(), 0)
        self.assertIsNone(b.get('x'))

    def test_expired_names_reusable_and_copy_missing_after_expiry(self):
        s = exercise.FileStorage(10)
        s.upload('a', 2, 1)
        s.advance_to(1)
        self.assertFalse(s.copy('a', 'b'))
        self.assertFalse(s.delete('a'))
        self.assertTrue(s.upload('a', 7, 4))
        self.assertEqual(s.get('a')['expires_at'], 5)
        s.advance_to(2)
        self.assertEqual(s.usage(), 7)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
