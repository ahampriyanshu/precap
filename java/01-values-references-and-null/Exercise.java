import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Summary(int present, int missing, long total) {}
    public static Long parseCount(String text) { throw new UnsupportedOperationException("Implement this stage"); }
    public static Summary summarize(List<String> inputs) { throw new UnsupportedOperationException("Implement this stage"); }
}
