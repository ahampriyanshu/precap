"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise

class PrototypeTests(unittest.TestCase):
    def test_filter_and_sort(self):
        copies = [("B2", "Python", True), ("B1", "Python", True), ("B3", "Python", False), ("A", "SQL", True)]
        self.assertEqual(exercise.available_copies(copies, "Python"), ["B1", "B2"])

    def test_unknown_and_case_sensitive(self):
        self.assertEqual(exercise.available_copies([("A", "Python", True)], "python"), [])
        self.assertEqual(exercise.available_copies([], "Python"), [])

    def test_input_and_result_isolation(self):
        copies = [("A", "Python", True)]
        exercise.available_copies(copies, "Python").clear()
        self.assertEqual(copies, [("A", "Python", True)])
        self.assertEqual(exercise.available_copies(copies, "Python"), ["A"])


class FinalTests(unittest.TestCase):
    def test_empty_and_unknown(self):
        library = exercise.Library([])
        self.assertIsNone(library.borrow("M", "Python"))
        self.assertEqual(library.available("Python"), [])
        self.assertEqual(library.loans(), [])
        self.assertFalse(library.return_copy("unknown", "M"))

    def test_copy_identity_and_deterministic_allocation(self):
        library = exercise.Library([("B2", "Python"), ("B1", "Python"), ("A", "SQL")])
        self.assertEqual(library.borrow("M1", "Python"), "B1")
        self.assertEqual(library.borrow("M2", "Python"), "B2")
        self.assertEqual(library.available("Python"), [])
        self.assertEqual(library.available("SQL"), ["A"])

    def test_unavailable_does_not_create_loan(self):
        library = exercise.Library([("B", "Python")])
        library.borrow("M1", "Python")
        self.assertIsNone(library.borrow("M2", "Python"))
        self.assertIsNone(library.borrow("M2", "missing"))
        self.assertEqual(library.loans(), [{"copy_id": "B", "title": "Python", "member_id": "M1"}])

    def test_duplicate_member_title_is_atomic(self):
        library = exercise.Library([("B1", "Python"), ("B2", "Python"), ("S", "SQL")])
        library.borrow("M", "Python")
        with self.assertRaises(ValueError):
            library.borrow("M", "Python")
        self.assertEqual(library.available("Python"), ["B2"])
        self.assertEqual(library.borrow("M", "SQL"), "S")
        self.assertEqual(len(library.loans()), 2)

    def test_duplicate_rejected_when_title_exhausted(self):
        library = exercise.Library([("B", "Python")])
        library.borrow("M", "Python")
        with self.assertRaises(ValueError):
            library.borrow("M", "Python")
        self.assertEqual(len(library.loans()), 1)

    def test_return_owner_and_reborrow(self):
        library = exercise.Library([("B", "Python")])
        library.borrow("M", "Python")
        self.assertTrue(library.return_copy("B", "M"))
        self.assertEqual(library.available("Python"), ["B"])
        self.assertEqual(library.borrow("M", "Python"), "B")

    def test_wrong_owner_preserves_loan(self):
        library = exercise.Library([("B", "Python")])
        library.borrow("M1", "Python")
        with self.assertRaises(ValueError):
            library.return_copy("B", "M2")
        self.assertEqual(library.loans()[0]["member_id"], "M1")
        self.assertEqual(library.available("Python"), [])

    def test_repeated_and_unknown_returns_are_noops(self):
        library = exercise.Library([("B", "Python")])
        library.borrow("M", "Python")
        library.return_copy("B", "M")
        self.assertFalse(library.return_copy("B", "M"))
        self.assertFalse(library.return_copy("missing", "M"))
        self.assertEqual(library.available("Python"), ["B"])
        self.assertEqual(library.loans(), [])

    def test_order_case_and_snapshots(self):
        library = exercise.Library([("B", "Python"), ("A", "SQL")])
        self.assertIsNone(library.borrow("M", "python"))
        library.borrow("M", "Python")
        library.borrow("N", "SQL")
        records = library.loans()
        self.assertEqual([row["copy_id"] for row in records], ["A", "B"])
        records[0]["member_id"] = "bad"
        records.clear()
        self.assertEqual(library.loans()[0]["member_id"], "N")
        library.return_copy("A", "N")
        library.available("SQL").clear()
        self.assertEqual(library.available("SQL"), ["A"])

    def test_invalid_input_and_requests(self):
        for copies in [[("B", "Python"), ("B", "SQL")], [("", "Python")], [("B", "")]]:
            with self.subTest(copies=copies), self.assertRaises(ValueError):
                exercise.Library(copies)
        library = exercise.Library([("B", "Python")])
        for member, title in [("", "Python"), ("M", "")]:
            with self.assertRaises(ValueError):
                library.borrow(member, title)
        with self.assertRaises(ValueError):
            library.return_copy("B", "")
        with self.assertRaises(ValueError):
            library.available("")
        self.assertEqual(library.loans(), [])

    def test_input_and_instance_isolation(self):
        copies = [("B", "Python")]
        a = exercise.Library(copies)
        b = exercise.Library(copies)
        copies.clear()
        a.borrow("M", "Python")
        self.assertEqual(b.available("Python"), ["B"])
        self.assertEqual(b.loans(), [])

    def test_bounded_loan_lifecycle(self):
        library = exercise.Library([("B1", "Python"), ("B2", "Python")])
        for index in range(40):
            member = "M" + str(index)
            self.assertEqual(library.borrow(member, "Python"), "B1")
            self.assertEqual(len(library.loans()), 1)
            self.assertTrue(library.return_copy("B1", member))
            self.assertFalse(library.return_copy("B1", member))
            self.assertEqual(library.available("Python"), ["B1", "B2"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
