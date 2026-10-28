"""Deterministic practice checks; standard library only."""
import argparse
import unittest
import exercise


class PrototypeTests(unittest.TestCase):
    def test_half_open_and_overlapping(self):
        c = exercise.RoomCalendar()
        self.assertTrue(c.reserve(10, 20))
        self.assertTrue(c.reserve(20, 25))
        self.assertFalse(c.reserve(19, 21))
        self.assertFalse(c.reserve(10, 20))
        self.assertTrue(c.reserve(0, 10))

    def test_invalid_preserves_calendar(self):
        c = exercise.RoomCalendar()
        c.reserve(2, 4)
        for start, end in [(-1, 2), (2, 2), (4, 3)]:
            with self.assertRaises(ValueError):
                c.reserve(start, end)
        self.assertEqual(c.slots(), [(2, 4)])

    def test_sorted_snapshots_and_instances(self):
        a, b = exercise.RoomCalendar(), exercise.RoomCalendar()
        a.reserve(8, 9)
        a.reserve(1, 2)
        self.assertEqual(a.slots(), [(1, 2), (8, 9)])
        a.slots().clear()
        self.assertEqual(len(a.slots()), 2)
        self.assertEqual(b.slots(), [])


class FinalTests(unittest.TestCase):
    def service(self):
        return exercise.MeetingRoomBooking({'C': 8, 'B': 4, 'A': 4})

    def test_deterministic_capacity_then_id_allocation(self):
        s = self.service()
        self.assertEqual(s.book('first', 10, 20, 4), ['A'])
        self.assertEqual(s.book('second', 10, 20, 4), ['B'])
        self.assertEqual(s.book('third', 10, 20, 5), ['C'])
        self.assertEqual(s.schedule('A'), [{'id': 'first', 'start': 10, 'end': 20, 'seats': 4}])

    def test_half_open_boundaries(self):
        s = exercise.MeetingRoomBooking({'A': 4})
        self.assertEqual(s.book('middle', 10, 20, 1), ['A'])
        self.assertEqual(s.book('before', 0, 10, 1), ['A'])
        self.assertEqual(s.book('after', 20, 30, 1), ['A'])
        self.assertEqual([r['id'] for r in s.schedule('A')], ['before', 'middle', 'after'])

    def test_all_overlap_shapes_reject(self):
        s = exercise.MeetingRoomBooking({'A': 4})
        s.book('base', 10, 20, 2)
        for index, (start, end) in enumerate([(9, 11), (19, 21), (11, 19), (9, 21), (10, 20)]):
            self.assertIsNone(s.book(str(index), start, end, 2))
        self.assertEqual(len(s.schedule('A')), 1)

    def test_multi_room_selection_and_atomic_failure(self):
        s = self.service()
        s.book('occupied', 10, 20, 5)
        self.assertIsNone(s.book('pair', 10, 20, 4, 3))
        self.assertEqual(s.schedule('A'), [])
        self.assertEqual(s.schedule('B'), [])
        self.assertEqual(s.book('pair', 10, 20, 4, 2), ['A', 'B'])
        self.assertEqual(s.allocation('pair'), ['A', 'B'])
        self.assertEqual(s.schedule('B')[0]['id'], 'pair')

    def test_capacity_rejection_does_not_consume_id(self):
        s = self.service()
        self.assertIsNone(s.book('x', 1, 2, 9))
        self.assertIsNone(s.allocation('x'))
        self.assertEqual(s.book('x', 1, 2, 8), ['C'])
        self.assertIsNone(s.book('too-many', 1, 2, 1, 4))
        self.assertEqual(s.schedule('A'), [])

    def test_cancel_frees_all_rooms_once(self):
        s = self.service()
        s.book('pair', 10, 20, 4, 2)
        self.assertTrue(s.cancel('pair'))
        self.assertFalse(s.cancel('pair'))
        self.assertFalse(s.cancel('missing'))
        self.assertIsNone(s.allocation('pair'))
        self.assertEqual(s.schedule('A'), [])
        self.assertEqual(s.schedule('B'), [])
        self.assertEqual(s.book('replacement', 10, 20, 4, 2), ['A', 'B'])

    def test_successful_ids_stay_reserved_after_cancel(self):
        s = self.service()
        s.book('x', 1, 2, 4)
        self.assertIsNone(s.book('x', 1, 2, 4))
        self.assertIsNone(s.book('x', 3, 4, 5))
        self.assertEqual(s.allocation('x'), ['A'])
        s.cancel('x')
        self.assertIsNone(s.book('x', 1, 2, 4))
        self.assertEqual(s.schedule('A'), [])

    def test_cancel_only_its_booking(self):
        s = exercise.MeetingRoomBooking({'A': 4})
        s.book('early', 1, 3, 1)
        s.book('late', 3, 5, 1)
        s.cancel('early')
        self.assertEqual(s.schedule('A'), [{'id': 'late', 'start': 3, 'end': 5, 'seats': 1}])
        self.assertEqual(s.allocation('late'), ['A'])

    def test_validation_precedes_existing_id_and_preserves_state(self):
        s = self.service()
        s.book('x', 10, 20, 4)
        before = s.schedule('A')
        requests = [('', 1, 2, 1, 1), ('bad', -1, 2, 1, 1), ('bad', 2, 2, 1, 1),
                    ('bad', 3, 2, 1, 1), ('bad', 1, 2, 0, 1), ('x', 1, 2, 1, 0)]
        for args in requests:
            with self.assertRaises(ValueError):
                s.book(*args)
        with self.assertRaises(ValueError):
            s.schedule('missing')
        self.assertEqual(s.schedule('A'), before)
        self.assertEqual(s.allocation('x'), ['A'])
        self.assertEqual(s.book('bad', 20, 21, 1), ['A'])

    def test_constructor_validation_and_empty_catalog(self):
        for rooms in [{'': 4}, {'A': 0}, {'A': -1}]:
            with self.assertRaises(ValueError):
                exercise.MeetingRoomBooking(rooms)
        s = exercise.MeetingRoomBooking({})
        self.assertIsNone(s.book('x', 0, 1, 1))
        self.assertFalse(s.cancel('x'))
        self.assertIsNone(s.allocation('x'))

    def test_input_and_returned_snapshots_are_detached(self):
        rooms = {'A': 4, 'B': 4}
        s = exercise.MeetingRoomBooking(rooms)
        rooms['A'] = 0
        rooms['C'] = 100
        chosen = s.book('x', 1, 2, 4, 2)
        chosen.clear()
        allocation = s.allocation('x')
        allocation.append('bad')
        schedule = s.schedule('A')
        schedule[0]['start'] = 99
        schedule.clear()
        self.assertEqual(s.allocation('x'), ['A', 'B'])
        self.assertEqual(s.schedule('A')[0]['start'], 1)
        with self.assertRaises(ValueError):
            s.schedule('C')

    def test_independent_instances_and_room_id_case(self):
        a = exercise.MeetingRoomBooking({'a': 2, 'A': 2})
        b = exercise.MeetingRoomBooking({'a': 2, 'A': 2})
        self.assertEqual(a.book('x', 0, 1, 1), ['A'])
        self.assertEqual(a.book('y', 0, 1, 1), ['a'])
        self.assertEqual(b.schedule('A'), [])
        self.assertEqual(b.book('x', 0, 1, 1), ['A'])

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--stage", choices=("prototype", "final"), default="final")
    options = parser.parse_args()
    selected = PrototypeTests if options.stage == "prototype" else FinalTests
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(selected)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    raise SystemExit(0 if result.wasSuccessful() else 1)
