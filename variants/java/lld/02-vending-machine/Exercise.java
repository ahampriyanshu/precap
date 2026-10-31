import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Product(String code, long price, long stock) {}
    public record Item(long price, long stock) {}
    public record Receipt(String code, long change) {}
    public static long changeDue(long price, long paid) { throw new UnsupportedOperationException("Implement this stage"); }
    public static class VendingMachine {
        public VendingMachine(List<Product> products) { throw new UnsupportedOperationException("Implement this stage"); }
        public long insert(long amount) { throw new UnsupportedOperationException("Implement this stage"); }
        public long balance() { throw new UnsupportedOperationException("Implement this stage"); }
        public Receipt select(String code) { throw new UnsupportedOperationException("Implement this stage"); }
        public long refund() { throw new UnsupportedOperationException("Implement this stage"); }
        public Map<String,Item> inventory() { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
