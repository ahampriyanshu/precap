import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public static final class Node {
        public final long value; public Node next;
        public Node(long value, Node next) { this.value=value; this.next=next; }
    }
    public static Node detach(Node head, Set<Long> blocked) { throw new UnsupportedOperationException("Preserve surviving node identities"); }
    public static List<Long> prototype(long[] values, long[] blocked) { throw new UnsupportedOperationException("Implement this stage"); }
    public static List<Long> solve(long[] values, long[] blocked) { throw new UnsupportedOperationException("Implement this stage"); }
}
