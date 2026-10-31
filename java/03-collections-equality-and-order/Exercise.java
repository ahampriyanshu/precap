import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Key(String namespace, String name) {}
    public static int distinctCount(List<Key> keys) { throw new UnsupportedOperationException("Implement this stage"); }
    public static Map<Key,Integer> frequencies(List<Key> keys) { throw new UnsupportedOperationException("Implement this stage"); }
}
