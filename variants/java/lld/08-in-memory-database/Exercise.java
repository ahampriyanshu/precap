import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Field(String name, String value) {}
    public static class RecordStore {
        public RecordStore() { throw new UnsupportedOperationException("Implement this stage"); }
        public void set(String key, String field, String value) { throw new UnsupportedOperationException("Implement this stage"); }
        public String get(String key, String field) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Field> scan(String key, String prefix) { throw new UnsupportedOperationException("Implement this stage"); }
    }
    public static class TemporalDatabase {
        public TemporalDatabase() { throw new UnsupportedOperationException("Implement this stage"); }
        public void set(long ts, String key, String field, String value, Long ttl) { throw new UnsupportedOperationException("Implement this stage"); }
        public String get(long ts, String key, String field) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean delete(long ts, String key, String field) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean compareAndSet(long ts, String key, String field, String expected, String value, Long ttl) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Field> scan(long ts, String key, String prefix) { throw new UnsupportedOperationException("Implement this stage"); }
        public String getAt(long ts, String key, String field, long at) { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
