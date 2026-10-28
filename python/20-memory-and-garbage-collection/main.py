"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise
import gc
import weakref

STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_live(self):
        class Item: pass
        item=Item()
        reference=exercise.observe(item)
        self.assertIs(reference(), item)


    def test_weakref_type(self):
        class Item: pass
        item=Item()
        self.assertIsInstance(exercise.observe(item), weakref.ReferenceType)


    def test_retained_reference(self):
        class Item: pass
        item=Item()
        retained=[item]
        reference=exercise.observe(item)
        del item
        gc.collect()
        self.assertIs(reference(), retained[0])


    def test_released_cycle(self):
        class Item: pass
        item=Item()
        item.link=item
        reference=exercise.observe(item)
        del item
        gc.collect()
        self.assertIsNone(reference())


    def test_independent(self):
        class Item: pass
        a=Item()
        b=Item()
        self.assertIs(exercise.observe(a)(), a)
        self.assertIs(exercise.observe(b)(), b)


class FinalTests(unittest.TestCase):
    def test_empty(self):
        cache=exercise.WeakCache()
        self.assertEqual(len(cache), 0)
        self.assertIsNone(cache.get("missing"))


    def test_live(self):
        class Item: pass
        item=Item()
        cache=exercise.WeakCache()
        self.assertIsNone(cache.put("x", item))
        self.assertIs(cache.get("x"), item)
        self.assertEqual(len(cache), 1)


    def test_replacement(self):
        class Item: pass
        a=Item()
        b=Item()
        cache=exercise.WeakCache()
        cache.put("x", a)
        cache.put("x", b)
        self.assertIs(cache.get("x"), b)
        self.assertEqual(len(cache), 1)


    def test_discard(self):
        class Item: pass
        item=Item()
        cache=exercise.WeakCache()
        cache.put("x", item)
        self.assertIsNone(cache.discard("x"))
        self.assertIsNone(cache.discard("missing"))
        self.assertEqual(len(cache), 0)
        self.assertIsNotNone(item)


    def test_cycle_collected(self):
        class Item: pass
        cache=exercise.WeakCache()
        item=Item()
        item.link=item
        observer=weakref.ref(item)
        cache.put("x", item)
        del item
        gc.collect()
        self.assertIsNone(observer())
        self.assertIsNone(cache.get("x"))
        self.assertEqual(len(cache), 0)


    def test_strong_owner(self):
        class Item: pass
        cache=exercise.WeakCache()
        item=Item()
        owner=[item]
        cache.put("x", item)
        del item
        gc.collect()
        self.assertIs(cache.get("x"), owner[0])
        self.assertEqual(len(cache), 1)


    def test_independent(self):
        class Item: pass
        item=Item()
        a=exercise.WeakCache()
        b=exercise.WeakCache()
        a.put("x", item)
        self.assertEqual(len(b), 0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
