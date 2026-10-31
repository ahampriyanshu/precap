import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Entry(String key, long value) {}
    public static List<String> touchOrder(List<String> keys, String key) { throw new UnsupportedOperationException("Implement this stage"); }
    public static class LRUCache {
        public LRUCache(int capacity) { throw new UnsupportedOperationException("Implement this stage"); }
        public void put(String key, long value) { throw new UnsupportedOperationException("Implement this stage"); }
        public Object get(String key, Object fallback) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean delete(String key) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Entry> items() { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
