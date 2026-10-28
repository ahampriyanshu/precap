"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise

class PrototypeTests(unittest.TestCase):
    def test_change_and_exact_payment(self):
        self.assertEqual(exercise.change_due(100, 150), 50)
        self.assertEqual(exercise.change_due(100, 100), 0)
        self.assertEqual(exercise.change_due(0, 0), 0)

    def test_insufficient(self):
        with self.assertRaises(ValueError):
            exercise.change_due(100, 99)

    def test_invalid_amounts(self):
        for price, paid in [(-1, 3), (1, -1), (1.5, 3), (1, True), (False, 0)]:
            with self.subTest(price=price, paid=paid), self.assertRaises(ValueError):
                exercise.change_due(price, paid)


class FinalTests(unittest.TestCase):
    def test_empty_machine_and_refund(self):
        machine = exercise.VendingMachine([])
        self.assertEqual(machine.inventory(), {})
        self.assertEqual(machine.balance(), 0)
        self.assertEqual(machine.refund(), 0)

    def test_insert_accumulates(self):
        machine = exercise.VendingMachine([])
        self.assertEqual(machine.insert(60), 60)
        self.assertEqual(machine.insert(50), 110)
        self.assertEqual(machine.balance(), 110)

    def test_purchase_with_change(self):
        machine = exercise.VendingMachine([("A", 100, 2)])
        machine.insert(150)
        self.assertEqual(machine.select("A"), {"code": "A", "change": 50})
        self.assertEqual(machine.balance(), 0)
        self.assertEqual(machine.inventory(), {"A": {"price": 100, "stock": 1}})

    def test_exact_purchase_and_sold_out(self):
        machine = exercise.VendingMachine([("A", 5, 1)])
        machine.insert(5)
        self.assertEqual(machine.select("A")["change"], 0)
        machine.insert(9)
        with self.assertRaises(ValueError):
            machine.select("A")
        self.assertEqual(machine.balance(), 9)
        self.assertEqual(machine.inventory()["A"]["stock"], 0)

    def test_insufficient_preserves_credit_and_inventory(self):
        machine = exercise.VendingMachine([("A", 100, 1)])
        machine.insert(99)
        for _ in range(2):
            with self.assertRaises(ValueError):
                machine.select("A")
            self.assertEqual(machine.balance(), 99)
            self.assertEqual(machine.inventory()["A"]["stock"], 1)
        machine.insert(1)
        self.assertEqual(machine.select("A")["change"], 0)

    def test_unknown_code_preserves_money(self):
        machine = exercise.VendingMachine([("A", 10, 1)])
        machine.insert(20)
        with self.assertRaises(KeyError):
            machine.select("missing")
        self.assertEqual(machine.refund(), 20)
        self.assertEqual(machine.inventory()["A"]["stock"], 1)

    def test_refund_once_then_new_session(self):
        machine = exercise.VendingMachine([("A", 5, 2)])
        machine.insert(12)
        self.assertEqual(machine.refund(), 12)
        self.assertEqual(machine.refund(), 0)
        self.assertEqual(machine.balance(), 0)
        machine.insert(5)
        machine.select("A")
        self.assertEqual(machine.refund(), 0)

    def test_invalid_insert_is_atomic(self):
        machine = exercise.VendingMachine([])
        machine.insert(7)
        for value in [0, -1, 1.5, True, "2"]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                machine.insert(value)
            self.assertEqual(machine.balance(), 7)

    def test_invalid_catalog(self):
        for products in [[("A", 1, 0), ("A", 2, 3)], [("", 1, 0)], [("A", 0, 1)], [("A", -1, 1)], [("A", 1, -1)], [("A", True, 1)], [("A", 1, 1.5)]]:
            with self.subTest(products=products), self.assertRaises(ValueError):
                exercise.VendingMachine(products)

    def test_snapshots_and_input_are_isolated(self):
        products = [("A", 10, 2)]
        machine = exercise.VendingMachine(products)
        products.clear()
        snapshot = machine.inventory()
        snapshot["A"]["stock"] = 999
        snapshot["A"]["price"] = 0
        snapshot.clear()
        self.assertEqual(machine.inventory(), {"A": {"price": 10, "stock": 2}})

    def test_product_and_machine_isolation(self):
        a = exercise.VendingMachine([("A", 2, 1), ("B", 3, 1)])
        b = exercise.VendingMachine([("A", 2, 1)])
        a.insert(2)
        a.select("A")
        self.assertEqual(a.inventory()["B"]["stock"], 1)
        self.assertEqual(b.inventory()["A"]["stock"], 1)
        self.assertEqual(b.balance(), 0)

    def test_bounded_money_conservation(self):
        machine = exercise.VendingMachine([("A", 7, 30)])
        inserted = returned = charged = 0
        for index in range(30):
            inserted += 10
            machine.insert(10)
            if index % 3 == 0:
                returned += machine.refund()
            else:
                returned += machine.select("A")["change"]
                charged += 7
            self.assertEqual(inserted, returned + charged + machine.balance())
        self.assertEqual(machine.inventory()["A"]["stock"], 10)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
