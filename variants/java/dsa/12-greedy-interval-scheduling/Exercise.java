import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Job(String id, long start, long end) {}
    public static List<String> prototype(List<Job> jobs) { throw new UnsupportedOperationException("Implement this stage"); }
    public static List<String> solve(List<Job> jobs) { throw new UnsupportedOperationException("Implement this stage"); }
}
