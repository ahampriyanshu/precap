import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    @FunctionalInterface public interface Transform { String apply(String value); }
    public static String applyAll(String input, List<Transform> transforms) { throw new UnsupportedOperationException("Implement this stage"); }
    public static Transform pipeline(List<Transform> transforms) { throw new UnsupportedOperationException("Implement this stage"); }
}
