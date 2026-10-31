import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record CopyState(String id, String title, boolean available) {}
    public record BookCopy(String id, String title) {}
    public record Loan(String copyId, String title, String memberId) {}
    public static List<String> availableCopies(List<CopyState> copies, String title) { throw new UnsupportedOperationException("Implement this stage"); }
    public static class Library {
        public Library(List<BookCopy> copies) { throw new UnsupportedOperationException("Implement this stage"); }
        public String borrow(String memberId, String title) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean returnCopy(String copyId, String memberId) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<String> available(String title) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Loan> loans() { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
