import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Message(String id, String payload) {}
    public record Delivery(String id, String payload, int attempt) {}
    public record DeadLetter(String id, String payload, int attempts) {}
    public static class MessageQueue {
        public MessageQueue() { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean publish(String messageId, String payload) { throw new UnsupportedOperationException("Implement this stage"); }
        public Message consume() { throw new UnsupportedOperationException("Implement this stage"); }
    }
    public static class MessageBroker {
        public MessageBroker(int maxAttempts) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean publish(String messageId, String payload) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean subscribe(String groupId) { throw new UnsupportedOperationException("Implement this stage"); }
        public Delivery poll(String groupId) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean ack(String groupId, String messageId) { throw new UnsupportedOperationException("Implement this stage"); }
        public String nack(String groupId, String messageId) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<DeadLetter> deadLetters(String groupId) { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
