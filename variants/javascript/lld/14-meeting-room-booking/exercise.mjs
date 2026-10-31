// Learner workspace. Keep the public API; replace unfinished bodies.
export class RoomCalendar {
  constructor() { throw new Error("Not implemented"); }
  reserve(start, end) { throw new Error("Not implemented"); }
  slots() { throw new Error("Not implemented"); }
}
export class MeetingRoomBooking {
  constructor(rooms) { throw new Error("Not implemented"); }
  book(bookingId, start, end, seats, roomCount = 1) { throw new Error("Not implemented"); }
  cancel(bookingId) { throw new Error("Not implemented"); }
  allocation(bookingId) { throw new Error("Not implemented"); }
  schedule(roomId) { throw new Error("Not implemented"); }
}
