import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {

    public static class KeyValueStore {
        public KeyValueStore() { throw new UnsupportedOperationException("Implement this stage"); }
        public void set(String key, String value) { throw new UnsupportedOperationException("Implement this stage"); }
        public String get(String key) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean delete(String key) { throw new UnsupportedOperationException("Implement this stage"); }
    }
    public static class TransactionalStore {
        public TransactionalStore() { throw new UnsupportedOperationException("Implement this stage"); }
        public void set(String key, String value) { throw new UnsupportedOperationException("Implement this stage"); }
        public String get(String key) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean delete(String key) { throw new UnsupportedOperationException("Implement this stage"); }
        public int begin() { throw new UnsupportedOperationException("Implement this stage"); }
        public int commit() { throw new UnsupportedOperationException("Implement this stage"); }
        public int rollback() { throw new UnsupportedOperationException("Implement this stage"); }
        public int depth() { throw new UnsupportedOperationException("Implement this stage"); }
        public Map<String,String> snapshot(String prefix) { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
