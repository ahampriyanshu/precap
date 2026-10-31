import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public static class ByteCache {
        public ByteCache(long byteBudget) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean put(String key, byte[] value) { throw new UnsupportedOperationException("Implement this stage"); }
        public byte[] get(String key) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean remove(String key) { throw new UnsupportedOperationException("Implement this stage"); }
        public long usage() { throw new UnsupportedOperationException("Implement this stage"); }
        public void clear() { throw new UnsupportedOperationException("Implement this stage"); }
    }
    public static byte[] copyBuffer(byte[] input) { throw new UnsupportedOperationException("Implement this stage"); }
}
