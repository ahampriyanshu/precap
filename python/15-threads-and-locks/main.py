"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise
import threading

STAGE = "final"

class PrototypeTests(unittest.TestCase):
    def test_initial(self):
        self.assertEqual(exercise.SafeCounter().value, 0)


    def test_increment(self):
        counter=exercise.SafeCounter()
        self.assertIsNone(counter.increment())
        self.assertEqual(counter.value, 1)


    def test_several(self):
        counter=exercise.SafeCounter()
        for _ in range(7): counter.increment()
        self.assertEqual(counter.value, 7)


    def test_independent(self):
        a=exercise.SafeCounter()
        b=exercise.SafeCounter()
        a.increment()
        self.assertEqual(b.value, 0)


    def test_threads(self):
        counter=exercise.SafeCounter()
        def increment_many():
            for _ in range(2000): counter.increment()
        threads=[threading.Thread(target=increment_many) for _ in range(4)]
        for thread in threads: thread.start()
        for thread in threads: thread.join()
        self.assertEqual(counter.value, 8000)


class FinalTests(unittest.TestCase):
    def test_counts(self):
        self.assertEqual(exercise.count_words([["a", "b"], ["a"]]), {"a": 2, "b": 1})


    def test_empty(self):
        self.assertEqual(exercise.count_words([]), {})
        self.assertEqual(exercise.count_words([[], []]), {})


    def test_case_and_empty_word(self):
        self.assertEqual(exercise.count_words([["A", "a", ""], [""]]), {"A": 1, "a": 1, "": 2})


    def test_many_updates(self):
        self.assertEqual(exercise.count_words([["x"]*1000 for _ in range(6)]), {"x": 6000})


    def test_nonmutation(self):
        chunks=[["b", "a"], ["a"]]
        exercise.count_words(chunks)
        self.assertEqual(chunks, [["b", "a"], ["a"]])


    def test_worker_consumption(self):
        main_id=threading.get_ident()
        seen=[]
        class Chunk:
            def __iter__(self):
                seen.append(threading.get_ident())
                return iter(["x"])
        self.assertEqual(exercise.count_words([Chunk(), Chunk()]), {"x": 2})
        self.assertEqual(len(seen), 2)
        self.assertTrue(all(identity != main_id for identity in seen))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default=STAGE)
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
