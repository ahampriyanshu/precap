import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Spot(String id, String kind) {}
    public record Ticket(long ticketId, String vehicleId, String vehicleKind, String spotId) {}
    public static String chooseSpot(List<Spot> spots, String vehicleKind) { throw new UnsupportedOperationException("Implement this stage"); }
    public static class ParkingLot {
        public ParkingLot(List<Spot> spots) { throw new UnsupportedOperationException("Implement this stage"); }
        public Ticket park(String vehicleId, String kind) { throw new UnsupportedOperationException("Implement this stage"); }
        public Ticket release(long ticketId) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Ticket> activeTickets() { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Spot> availableSpots() { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
