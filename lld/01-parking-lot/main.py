"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise

class PrototypeTests(unittest.TestCase):
    def test_smallest_then_identifier(self):
        spots = [("V", "van"), ("C2", "car"), ("C1", "car")]
        self.assertEqual(exercise.choose_spot(spots, "car"), "C1")

    def test_compatibility_and_empty(self):
        self.assertIsNone(exercise.choose_spot([("C", "car")], "van"))
        self.assertIsNone(exercise.choose_spot([], "motorcycle"))
        self.assertEqual(exercise.choose_spot([("C", "car")], "motorcycle"), "C")

    def test_input_is_unchanged(self):
        spots = [("V", "van"), ("M", "motorcycle")]
        original = list(spots)
        exercise.choose_spot(spots, "motorcycle")
        self.assertEqual(spots, original)

    def test_invalid_and_duplicate(self):
        for spots, kind in [([("M", "motorcycle"), ("X", "bus")], "car"), ([("", "car")], "car"), ([("A", "car"), ("A", "van")], "car"), ([], "bus"), ([], []), ([("A", None)], "car")]:
            with self.subTest(spots=spots, kind=kind), self.assertRaises(ValueError):
                exercise.choose_spot(spots, kind)


class FinalTests(unittest.TestCase):
    def test_empty_lot(self):
        lot = exercise.ParkingLot([])
        self.assertIsNone(lot.park("A", "car"))
        self.assertEqual(lot.active_tickets(), [])
        self.assertEqual(lot.available_spots(), [])

    def test_allocation_policy(self):
        lot = exercise.ParkingLot([("V", "van"), ("C2", "car"), ("C1", "car"), ("M", "motorcycle")])
        self.assertEqual(lot.park("car1", "car"), {"ticket_id": 1, "vehicle_id": "car1", "vehicle_kind": "car", "spot_id": "C1"})
        self.assertEqual(lot.park("car2", "car")["spot_id"], "C2")
        self.assertEqual(lot.park("bike", "motorcycle")["spot_id"], "M")

    def test_large_vehicle_cannot_use_small_spot(self):
        lot = exercise.ParkingLot([("M", "motorcycle"), ("C", "car")])
        self.assertIsNone(lot.park("van", "van"))
        self.assertEqual(lot.available_spots(), [("M", "motorcycle"), ("C", "car")])
        self.assertEqual(lot.park("car", "car")["ticket_id"], 1)

    def test_full_does_not_consume_ticket_number(self):
        lot = exercise.ParkingLot([("A", "car")])
        self.assertEqual(lot.park("one", "car")["ticket_id"], 1)
        self.assertIsNone(lot.park("two", "car"))
        lot.release(1)
        self.assertEqual(lot.park("two", "car")["ticket_id"], 2)

    def test_duplicate_active_vehicle_is_atomic(self):
        lot = exercise.ParkingLot([("A", "car"), ("B", "car")])
        lot.park("one", "car")
        with self.assertRaises(ValueError):
            lot.park("one", "motorcycle")
        self.assertEqual(len(lot.active_tickets()), 1)
        self.assertEqual(lot.park("two", "car")["ticket_id"], 2)

    def test_release_once_and_repark(self):
        lot = exercise.ParkingLot([("A", "car")])
        ticket = lot.park("one", "car")
        self.assertEqual(lot.release(1), ticket)
        self.assertIsNone(lot.release(1))
        self.assertIsNone(lot.release(999))
        self.assertEqual(lot.park("one", "car")["ticket_id"], 2)
        self.assertIsNone(lot.release(1))
        self.assertEqual(len(lot.active_tickets()), 1)

    def test_ticket_snapshots_are_isolated(self):
        lot = exercise.ParkingLot([("A", "car")])
        ticket = lot.park("one", "car")
        ticket["spot_id"] = "bad"
        snapshot = lot.active_tickets()
        snapshot[0]["vehicle_id"] = "bad"
        snapshot.clear()
        self.assertEqual(lot.release(1)["spot_id"], "A")
        self.assertEqual(lot.available_spots(), [("A", "car")])

    def test_free_snapshot_and_constructor_input(self):
        spots = [("V", "van"), ("C", "car"), ("M", "motorcycle")]
        lot = exercise.ParkingLot(spots)
        spots.clear()
        result = lot.available_spots()
        self.assertEqual(result, [("M", "motorcycle"), ("C", "car"), ("V", "van")])
        result.clear()
        self.assertEqual(len(lot.available_spots()), 3)

    def test_invalid_requests_are_atomic(self):
        lot = exercise.ParkingLot([("A", "car")])
        for vehicle, kind in [("", "car"), (None, "car"), ("x", "bus"), ("x", [])]:
            with self.assertRaises(ValueError):
                lot.park(vehicle, kind)
        self.assertEqual(lot.park("ok", "car")["ticket_id"], 1)

    def test_invalid_inventory(self):
        for spots in [[("A", "car"), ("A", "van")], [("", "car")], [("A", "bus")]]:
            with self.subTest(spots=spots), self.assertRaises(ValueError):
                exercise.ParkingLot(spots)

    def test_instances_are_independent(self):
        a = exercise.ParkingLot([("A", "car")])
        b = exercise.ParkingLot([("A", "car")])
        a.park("one", "car")
        self.assertEqual(b.park("one", "car")["ticket_id"], 1)

    def test_bounded_allocation_release_cycles(self):
        lot = exercise.ParkingLot([("A", "car"), ("B", "van")])
        for index in range(40):
            ticket = lot.park("same", "car")
            self.assertEqual((ticket["ticket_id"], ticket["spot_id"]), (index + 1, "A"))
            self.assertEqual(lot.release(ticket["ticket_id"]), ticket)
            self.assertEqual(lot.active_tickets(), [])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
