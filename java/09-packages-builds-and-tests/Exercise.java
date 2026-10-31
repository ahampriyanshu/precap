import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Options(int port, boolean verbose) {}
    public static int parsePort(String value) { throw new UnsupportedOperationException("Implement this stage"); }
    public static Options parseOptions(String[] args) { throw new UnsupportedOperationException("Implement this stage"); }
}
