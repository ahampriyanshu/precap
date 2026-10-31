import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.stream.*;

/** Learner workspace. Replace each unfinished body; keep the public API. */
public class Exercise {
    public record TransferResult(long sourceBalance, long targetBalance) {}
    public record Spending(String accountId, long outgoing) {}
    public static class BalanceAccount {
        public BalanceAccount() { throw new UnsupportedOperationException("Implement this stage"); }
        public long balance() { throw new UnsupportedOperationException("Implement this stage"); }
        public long deposit(long amount) { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean withdraw(long amount) { throw new UnsupportedOperationException("Implement this stage"); }
    }
    public static class Bank {
        public Bank() { throw new UnsupportedOperationException("Implement this stage"); }
        public boolean createAccount(String accountId) { throw new UnsupportedOperationException("Implement this stage"); }
        public Long balance(String accountId) { throw new UnsupportedOperationException("Implement this stage"); }
        public Long deposit(String accountId, long amount) { throw new UnsupportedOperationException("Implement this stage"); }
        public TransferResult transfer(String requestId, String source, String target, long amount) { throw new UnsupportedOperationException("Implement this stage"); }
        public List<Spending> topSpenders(int limit) { throw new UnsupportedOperationException("Implement this stage"); }
    }

}
