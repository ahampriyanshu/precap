"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise

class PrototypeTests(unittest.TestCase):
    def test_existing_key_moves_to_end(self):
        self.assertEqual(exercise.touch_order(["A", "B", "C"], "B"), ["A", "C", "B"])

    def test_new_empty_and_repeated(self):
        self.assertEqual(exercise.touch_order([], "A"), ["A"])
        self.assertEqual(exercise.touch_order(["A", "B"], "C"), ["A", "B", "C"])
        self.assertEqual(exercise.touch_order(["A", "B"], "B"), ["A", "B"])

    def test_input_isolation(self):
        keys = ["A", "B"]
        result = exercise.touch_order(keys, "A")
        result.clear()
        self.assertEqual(keys, ["A", "B"])


class FinalTests(unittest.TestCase):
    def test_empty_and_default_identity(self):
        cache = exercise.LRUCache(2)
        marker = object()
        self.assertIsNone(cache.get("missing"))
        self.assertIs(cache.get("missing", marker), marker)
        self.assertEqual(cache.items(), [])

    def test_put_and_order(self):
        cache = exercise.LRUCache(3)
        self.assertIsNone(cache.put("A", 0))
        cache.put("B", -2)
        self.assertEqual(cache.items(), [("A", 0), ("B", -2)])

    def test_access_refreshes_before_eviction(self):
        cache = exercise.LRUCache(2)
        cache.put("A", 1)
        cache.put("B", 2)
        self.assertEqual(cache.get("A"), 1)
        cache.put("C", 3)
        self.assertEqual(cache.items(), [("A", 1), ("C", 3)])
        self.assertIsNone(cache.get("B"))

    def test_update_refreshes_without_growing(self):
        cache = exercise.LRUCache(2)
        cache.put("A", 1)
        cache.put("B", 2)
        cache.put("A", 9)
        self.assertEqual(cache.items(), [("B", 2), ("A", 9)])
        cache.put("C", 3)
        self.assertEqual(cache.items(), [("A", 9), ("C", 3)])

    def test_miss_does_not_refresh(self):
        cache = exercise.LRUCache(2)
        cache.put("A", 1)
        cache.put("B", 2)
        self.assertEqual(cache.get("C", 5), 5)
        cache.put("C", 3)
        self.assertEqual(cache.items(), [("B", 2), ("C", 3)])

    def test_zero_capacity(self):
        cache = exercise.LRUCache(0)
        for _ in range(5):
            self.assertIsNone(cache.put("A", 1))
            self.assertEqual(cache.items(), [])
            self.assertIsNone(cache.get("A"))
            self.assertFalse(cache.delete("A"))

    def test_capacity_one_and_repeated_update(self):
        cache = exercise.LRUCache(1)
        for value in range(20):
            cache.put("A", value)
            self.assertEqual(cache.items(), [("A", value)])
        cache.put("B", 2)
        self.assertEqual(cache.items(), [("B", 2)])

    def test_delete_is_idempotent_and_preserves_order(self):
        cache = exercise.LRUCache(3)
        for key, value in [("A", 1), ("B", 2), ("C", 3)]:
            cache.put(key, value)
        self.assertTrue(cache.delete("B"))
        self.assertFalse(cache.delete("B"))
        self.assertEqual(cache.items(), [("A", 1), ("C", 3)])
        cache.put("B", 4)
        self.assertEqual(cache.items(), [("A", 1), ("C", 3), ("B", 4)])

    def test_invalid_inputs_are_atomic(self):
        for value in [-1, True, 1.5, "2"]:
            with self.subTest(capacity=value), self.assertRaises(ValueError):
                exercise.LRUCache(value)
        cache = exercise.LRUCache(1)
        cache.put("A", 1)
        for key, value in [("", 2), ("B", True), ("B", 1.5), (None, 2)]:
            with self.subTest(key=key, value=value), self.assertRaises(ValueError):
                cache.put(key, value)
            self.assertEqual(cache.items(), [("A", 1)])
        for operation in [cache.get, cache.delete]:
            with self.assertRaises(ValueError):
                operation("")
        self.assertEqual(cache.items(), [("A", 1)])

    def test_snapshots_and_instances_are_independent(self):
        a = exercise.LRUCache(2)
        b = exercise.LRUCache(2)
        a.put("A", 1)
        a.items().clear()
        self.assertEqual(a.items(), [("A", 1)])
        self.assertEqual(b.items(), [])

    def test_bounded_reference_model(self):
        import random
        randomizer = random.Random(731)
        for capacity in range(4):
            cache = exercise.LRUCache(capacity)
            model = []
            for _ in range(150):
                key = randomizer.choice(["A", "B", "C", "D"])
                action = randomizer.randrange(3)
                existing = next((pair for pair in model if pair[0] == key), None)
                if action == 0:
                    value = randomizer.randrange(-5, 6)
                    cache.put(key, value)
                    model = [pair for pair in model if pair[0] != key] + [(key, value)]
                    model = model[-capacity:] if capacity else []
                elif action == 1:
                    self.assertEqual(cache.get(key, "missing"), existing[1] if existing else "missing")
                    if existing:
                        model.remove(existing)
                        model.append(existing)
                else:
                    self.assertEqual(cache.delete(key), existing is not None)
                    model = [pair for pair in model if pair[0] != key]
                self.assertEqual(cache.items(), model)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
