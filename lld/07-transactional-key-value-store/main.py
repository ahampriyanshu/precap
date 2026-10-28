"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise

class PrototypeTests(unittest.TestCase):
    def test_set_get_overwrite(self):
        s = exercise.KeyValueStore()
        self.assertIsNone(s.get('x'))
        self.assertIsNone(s.set('x', 'one'))
        s.set('x', 'two')
        self.assertEqual(s.get('x'), 'two')

    def test_empty_and_delete(self):
        s = exercise.KeyValueStore()
        s.set('', '')
        self.assertEqual(s.get(''), '')
        self.assertTrue(s.delete(''))
        self.assertFalse(s.delete(''))
        self.assertIsNone(s.get(''))

    def test_independent(self):
        a, b = exercise.KeyValueStore(), exercise.KeyValueStore()
        a.set('k', 'v')
        self.assertIsNone(b.get('k'))

class FinalTests(unittest.TestCase):
    def test_base_crud_and_empty_values(self):
        s = exercise.TransactionalStore()
        self.assertEqual(s.depth(), 0)
        self.assertIsNone(s.set('', ''))
        s.set('x', '1'); s.set('x', '2')
        self.assertEqual(s.get(''), '')
        self.assertEqual(s.get('x'), '2')
        self.assertTrue(s.delete('x'))
        self.assertFalse(s.delete('x'))
        self.assertEqual(s.snapshot(), {'': ''})

    def test_rollback_restores_changes_and_deletion(self):
        s = exercise.TransactionalStore()
        s.set('a', 'base'); s.set('b', 'keep')
        self.assertEqual(s.begin(), 1)
        s.set('a', 'local'); s.set('c', 'new'); s.delete('b')
        self.assertEqual(s.snapshot(), {'a': 'local', 'c': 'new'})
        self.assertEqual(s.rollback(), 0)
        self.assertEqual(s.snapshot(), {'a': 'base', 'b': 'keep'})

    def test_commit_persists_current_view(self):
        s = exercise.TransactionalStore()
        s.set('a', 'old'); s.set('gone', 'x')
        s.begin(); s.set('a', 'new'); s.delete('gone')
        self.assertEqual(s.commit(), 0)
        self.assertEqual(s.snapshot(), {'a': 'new'})
        s.begin(); s.set('a', 'later'); s.rollback()
        self.assertEqual(s.get('a'), 'new')

    def test_inner_commit_is_undone_by_outer_rollback(self):
        s = exercise.TransactionalStore()
        s.set('mode', 'base')
        s.begin(); s.set('mode', 'outer')
        self.assertEqual(s.begin(), 2)
        s.set('mode', 'inner'); s.set('new', 'yes')
        self.assertEqual(s.commit(), 1)
        self.assertEqual(s.get('mode'), 'inner')
        self.assertEqual(s.rollback(), 0)
        self.assertEqual(s.snapshot(), {'mode': 'base'})

    def test_inner_rollback_leaves_outer_edits(self):
        s = exercise.TransactionalStore()
        s.begin(); s.set('x', 'outer')
        s.begin(); s.delete('x'); s.set('y', 'inner')
        self.assertEqual(s.rollback(), 1)
        self.assertEqual(s.snapshot(), {'x': 'outer'})
        self.assertEqual(s.commit(), 0)
        self.assertEqual(s.snapshot(), {'x': 'outer'})

    def test_delete_hides_parent_and_can_recreate(self):
        s = exercise.TransactionalStore()
        s.set('x', '')
        s.begin()
        self.assertTrue(s.delete('x'))
        self.assertIsNone(s.get('x'))
        self.assertFalse(s.delete('x'))
        s.begin(); s.set('x', 'child'); s.commit()
        self.assertEqual(s.get('x'), 'child')
        s.rollback()
        self.assertEqual(s.get('x'), '')

    def test_prefix_order_and_snapshot_isolation(self):
        s = exercise.TransactionalStore()
        for key in ('ab', 'a', 'Ab', 'aa'): s.set(key, key)
        s.begin(); s.set('ac', 'local')
        rows = s.snapshot('a')
        self.assertEqual(list(rows), ['a', 'aa', 'ab', 'ac'])
        rows['a'] = 'tampered'; rows['bad'] = 'new'; del rows['aa']
        self.assertEqual(s.get('a'), 'a')
        self.assertEqual(s.get('aa'), 'aa')
        self.assertIsNone(s.get('bad'))
        s.rollback()
        self.assertIsNone(s.get('ac'))
        self.assertEqual(s.snapshot('no'), {})

    def test_invalid_boundaries_preserve_state(self):
        s = exercise.TransactionalStore()
        s.set('a', 'v')
        for method in (s.commit, s.rollback, s.commit):
            with self.assertRaises(RuntimeError): method()
            self.assertEqual(s.depth(), 0)
            self.assertEqual(s.snapshot(), {'a': 'v'})
        self.assertEqual(s.begin(), 1)
        self.assertEqual(s.rollback(), 0)

    def test_three_levels_close_only_one_frame(self):
        s = exercise.TransactionalStore()
        for n in range(1, 4):
            self.assertEqual(s.begin(), n)
            s.set(str(n), str(n))
        self.assertEqual(s.commit(), 2)
        self.assertEqual(s.snapshot(), {'1': '1', '2': '2', '3': '3'})
        self.assertEqual(s.rollback(), 1)
        self.assertEqual(s.snapshot(), {'1': '1'})
        self.assertEqual(s.commit(), 0)
        self.assertEqual(s.snapshot(), {'1': '1'})

    def test_instance_isolation(self):
        a, b = exercise.TransactionalStore(), exercise.TransactionalStore()
        a.begin(); a.set('x', 'a')
        self.assertEqual(b.depth(), 0)
        self.assertEqual(b.snapshot(), {})
        b.set('x', 'b'); a.rollback()
        self.assertEqual(b.get('x'), 'b')
        self.assertIsNone(a.get('x'))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
