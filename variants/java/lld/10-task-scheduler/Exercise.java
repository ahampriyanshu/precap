import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record TaskItem(long id, String name) {}
    public record Task(long id, String name, long priority, String status, String worker, Long expiresAt, Long token) {}
    public static class PriorityQueue {
        public PriorityQueue() { throw new UnsupportedOperationException("Implement this stage"); }
        public long add(String name, long priority) { throw new UnsupportedOperationException("Implement this stage"); }
        public TaskItem pop() { throw new UnsupportedOperationException("Implement this stage"); }
    }
    public static class TaskScheduler {
        public TaskScheduler() { throw new UnsupportedOperationException("Implement this stage"); }
        public long addTask(String name, long priority) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean addWorker(String workerId, int capacity) { throw new UnsupportedOperationException("Implement this stage"); }
        public Task dispatch(long ts, String workerId, long lease) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean complete(long ts, long taskId, long leaseToken) { throw new UnsupportedOperationException("Implement this stage"); }
        public Task getTask(long ts, long taskId) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Task> active(long ts, String workerId) { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
