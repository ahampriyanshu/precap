import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Decision(boolean allowed, List<Long> history) {}
    public static Decision allowRequest(List<Long> recent, int limit, long window, long now) { throw new UnsupportedOperationException("Implement this stage"); }
    public static class SlidingWindowLimiter {
        public SlidingWindowLimiter(int limit, long window) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean allow(String clientId, long now) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Long> history(String clientId) { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
