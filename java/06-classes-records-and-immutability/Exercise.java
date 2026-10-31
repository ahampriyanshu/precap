import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Snapshot(String name, List<String> tags) {}
    public static List<String> copyTags(List<String> tags) { throw new UnsupportedOperationException("Implement this stage"); }
    public static Snapshot freeze(String name, List<String> tags) { throw new UnsupportedOperationException("Implement this stage"); }
}
