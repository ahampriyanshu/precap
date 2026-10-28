"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


class PrototypeTests(unittest.TestCase):
    def test_snapshot_shape(self):
        draft = exercise.RecipeDraft('Soup', ['water'], ['boil'])
        self.assertEqual(draft.snapshot(), {'name': 'Soup', 'ingredients': ['water'], 'steps': ['boil']})

    def test_input_and_output_copies(self):
        ingredients, steps = ['salt'], ['mix']
        draft = exercise.RecipeDraft('A', ingredients, steps)
        ingredients.clear()
        steps.append('serve')
        snap = draft.snapshot()
        snap['ingredients'].clear()
        self.assertEqual(draft.snapshot()['ingredients'], ['salt'])
        self.assertEqual(draft.snapshot()['steps'], ['mix'])

    def test_empty_content_and_instances(self):
        a = exercise.RecipeDraft('', [], [])
        b = exercise.RecipeDraft('B', ['x', 'x'], [''])
        self.assertEqual(a.snapshot(), {'name': '', 'ingredients': [], 'steps': []})
        self.assertEqual(b.snapshot()['ingredients'], ['x', 'x'])


class FinalTests(unittest.TestCase):
    def manager(self):
        manager = exercise.RecipeManager()
        manager.add_user('editor', ['read', 'write'])
        return manager

    def test_creation_and_failed_id_allocation(self):
        m = self.manager()
        self.assertIsNone(m.add('unknown', 'A', [], []))
        self.assertEqual(m.add('editor', 'A', ['x'], ['mix']), 'recipe1')
        self.assertIsNone(m.add('editor', 'A', [], []))
        self.assertEqual(m.add('editor', 'a', [], []), 'recipe2')
        self.assertEqual(m.get('editor', 'recipe1'), {'id': 'recipe1', 'version': 1, 'name': 'A', 'ingredients': ['x'], 'steps': ['mix']})

    def test_explicit_permissions(self):
        m = self.manager()
        m.add_user('reader', ['read'])
        m.add_user('writer', ['write'])
        m.add_user('none', [])
        rid = m.add('writer', 'A', [], [])
        self.assertIsNone(m.get('writer', rid))
        self.assertEqual(m.get('reader', rid)['name'], 'A')
        self.assertIsNone(m.update('reader', rid, 'B', [], []))
        self.assertIsNone(m.rollback('none', rid, 1))
        self.assertEqual(m.history('unknown', rid), [])
        self.assertEqual(m.by_ingredient('writer', ''), [])

    def test_user_validation_is_atomic(self):
        m = self.manager()
        with self.assertRaises(ValueError):
            m.add_user('editor', ['admin'])
        with self.assertRaises(ValueError):
            m.add_user('', ['read'])
        self.assertFalse(m.add_user('editor', []))
        permissions = ['read']
        self.assertTrue(m.add_user('reader', permissions))
        permissions.append('write')
        self.assertIsNone(m.add('reader', 'bad', [], []))
        self.assertEqual(m.add('editor', 'good', [], []), 'recipe1')

    def test_updates_and_current_name_index(self):
        m = self.manager()
        a = m.add('editor', 'A', [], [])
        b = m.add('editor', 'B', [], [])
        self.assertIsNone(m.update('editor', a, 'B', ['bad'], []))
        self.assertEqual(len(m.history('editor', a)), 1)
        self.assertEqual(m.update('editor', a, 'C', ['x'], []), 2)
        self.assertEqual(m.add('editor', 'A', [], []), 'recipe3')
        self.assertEqual(m.get('editor', b)['name'], 'B')

    def test_versions_are_immutable_and_ordered(self):
        m = self.manager()
        ingredients, steps = ['x'], ['first']
        rid = m.add('editor', 'A', ingredients, steps)
        ingredients.append('bad')
        steps.clear()
        m.update('editor', rid, 'B', ['y'], ['second'])
        self.assertEqual(m.get('editor', rid, 1)['ingredients'], ['x'])
        self.assertEqual(m.get('editor', rid, 1)['steps'], ['first'])
        self.assertEqual([v['version'] for v in m.history('editor', rid)], [1, 2])
        self.assertEqual(m.get('editor', rid)['name'], 'B')

    def test_rollback_appends_and_keeps_future_versions(self):
        m = self.manager()
        rid = m.add('editor', 'A', ['x'], [])
        m.update('editor', rid, 'B', ['y'], [])
        self.assertEqual(m.rollback('editor', rid, 1), 3)
        self.assertEqual(m.get('editor', rid, 2)['name'], 'B')
        self.assertEqual(m.get('editor', rid)['name'], 'A')
        self.assertEqual(m.rollback('editor', rid, 3), 4)
        self.assertEqual(m.update('editor', rid, 'A', ['x'], []), 5)
        self.assertEqual(len(m.history('editor', rid)), 5)

    def test_rollback_name_collision_is_atomic(self):
        m = self.manager()
        rid = m.add('editor', 'A', [], [])
        m.update('editor', rid, 'B', [], [])
        m.add('editor', 'A', [], [])
        before = m.history('editor', rid)
        self.assertIsNone(m.rollback('editor', rid, 1))
        self.assertEqual(m.history('editor', rid), before)
        self.assertEqual(m.get('editor', rid)['name'], 'B')

    def test_missing_and_invalid_versions(self):
        m = self.manager()
        rid = m.add('editor', 'A', [], [])
        for version in [0, -1, 2]:
            self.assertIsNone(m.get('editor', rid, version))
            self.assertIsNone(m.rollback('editor', rid, version))
        self.assertIsNone(m.get('editor', 'missing'))
        self.assertEqual(m.history('editor', 'missing'), [])
        self.assertIsNone(m.update('editor', 'missing', 'X', [], []))
        self.assertEqual(len(m.history('editor', rid)), 1)

    def test_empty_names_reject_before_mutation(self):
        m = self.manager()
        with self.assertRaises(ValueError):
            m.add('unknown', '', [], [])
        rid = m.add('editor', 'A', [], [])
        with self.assertRaises(ValueError):
            m.update('editor', rid, '', [], [])
        self.assertEqual(m.get('editor', rid)['name'], 'A')
        self.assertEqual(len(m.history('editor', rid)), 1)

    def test_ingredient_order_duplicates_and_latest_only(self):
        m = self.manager()
        a = m.add('editor', 'Z', ['salt', 'salt'], [])
        b = m.add('editor', 'B', ['salt'], [])
        c = m.add('editor', 'A', ['salt'], [])
        self.assertEqual(m.by_ingredient('editor', 'salt'), [c, b, a])
        self.assertEqual(m.by_ingredient('editor', 'Salt'), [])
        m.update('editor', b, 'B', [], [])
        self.assertEqual(m.by_ingredient('editor', 'salt'), [c, a])

    def test_returned_snapshots_are_detached(self):
        m = self.manager()
        rid = m.add('editor', 'A', ['x'], ['mix'])
        m.get('editor', rid)['ingredients'].clear()
        history = m.history('editor', rid)
        history[0]['steps'].append('bad')
        history.clear()
        m.by_ingredient('editor', 'x').clear()
        self.assertEqual(m.get('editor', rid)['ingredients'], ['x'])
        self.assertEqual(m.get('editor', rid)['steps'], ['mix'])
        self.assertEqual(len(m.history('editor', rid)), 1)

    def test_instances_are_independent(self):
        a, b = self.manager(), self.manager()
        self.assertEqual(a.add('editor', 'A', [], []), 'recipe1')
        self.assertEqual(b.history('editor', 'recipe1'), [])
        self.assertEqual(b.add('editor', 'A', [], []), 'recipe1')

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
