import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Interval(long start, long end) {}
    public record Reservation(String id, long start, long end, int seats) {}
    public static class RoomCalendar {
        public RoomCalendar() { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean reserve(long start, long end) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Interval> slots() { throw new UnsupportedOperationException("Implement this stage"); }
    }
    public static class MeetingRoomBooking {
        public MeetingRoomBooking(Map<String,Integer> rooms) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<String> book(String bookingId, long start, long end, int seats, int roomCount) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean cancel(String bookingId) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<String> allocation(String bookingId) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Reservation> schedule(String roomId) { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
