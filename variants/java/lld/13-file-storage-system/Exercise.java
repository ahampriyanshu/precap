import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record StoredFile(String name, long size, Long expiresAt) {}
    public static class FileCatalog {
        public FileCatalog() { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean upload(String name, long size) { throw new UnsupportedOperationException("Implement this stage"); }
        public Long get(String name) { throw new UnsupportedOperationException("Implement this stage"); }
    }
    public static class FileStorage {
        public FileStorage(long quota) { throw new UnsupportedOperationException("Implement this stage"); }
        public void advanceTo(long timestamp) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean upload(String name, long size, Long ttl) { throw new UnsupportedOperationException("Implement this stage"); }
        public StoredFile get(String name) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean copy(String source, String destination) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean delete(String name) { throw new UnsupportedOperationException("Implement this stage"); }
        public long usage() { throw new UnsupportedOperationException("Implement this stage"); }
        public List<StoredFile> search(String prefix, int limit) { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
