import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record Settlement(String debtor, String creditor, long amount) {}
    public static Map<String,Long> splitEqual(long total, List<String> participants) { throw new UnsupportedOperationException("Implement this stage"); }
    public static class ExpenseSharing {
        public ExpenseSharing(List<String> members) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean addExpense(String operationId, String payer, long total, List<String> participants) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean settle(String operationId, String debtor, String creditor, long amount) { throw new UnsupportedOperationException("Implement this stage"); }
        public Map<String,Long> balances() { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Settlement> suggestSettlements() { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
