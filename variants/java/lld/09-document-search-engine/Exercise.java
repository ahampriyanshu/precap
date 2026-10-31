import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Hit(String documentId, int score) {}
    public record Stats(int documentCount, long tokenCount) {}
    public static List<String> tokenize(String text) { throw new UnsupportedOperationException("Implement this stage"); }
    public static class SearchEngine {
        public SearchEngine() { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean add(String documentId, String text) { throw new UnsupportedOperationException("Implement this stage"); }
        public String get(String documentId) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean update(String documentId, String text) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean delete(String documentId) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Hit> search(String term, int limit) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Hit> searchPhrase(String phrase, int limit) { throw new UnsupportedOperationException("Implement this stage"); }
        public Stats stats() { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
