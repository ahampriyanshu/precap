import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;

public class Main {
    static int passed, failed;
    static boolean prototype;
    interface Checked { void run() throws Exception; }
    static void test(String name, Checked body) {
        try { body.run(); passed++; System.out.println("PASS " + name); }
        catch (Throwable error) { failed++; System.out.println("FAIL " + name + ": " + error); }
    }
    static void eq(Object actual, Object expected) {
        if(actual instanceof Map<?,?> a && expected instanceof Map<?,?> b && !new ArrayList<>(a.keySet()).equals(new ArrayList<>(b.keySet()))) throw new AssertionError("map key order differs");
        if (!Objects.deepEquals(actual, expected)) throw new AssertionError("expected " + show(expected) + ", got " + show(actual));
    }
    static String show(Object value) { return Arrays.deepToString(new Object[]{value}); }
    static void yes(boolean condition) { if (!condition) throw new AssertionError("condition was false"); }
    static void error(Class<? extends Throwable> kind, Checked body) throws Exception {
        try { body.run(); } catch (Throwable e) { if (kind.isInstance(e)) return; throw new AssertionError("expected " + kind.getSimpleName() + ", got " + e,e); }
        throw new AssertionError("expected " + kind.getSimpleName());
    }
    @SafeVarargs static <T> List<T> list(T... values) { return new ArrayList<>(Arrays.asList(values)); }
    static <K,V> Map<K,V> map(Object... values) {
        Map<K,V> result=new LinkedHashMap<>();
        for(int i=0;i<values.length;i+=2) { @SuppressWarnings("unchecked") K k=(K)values[i]; @SuppressWarnings("unchecked") V v=(V)values[i+1]; result.put(k,v); }
        return result;
    }
    static void suites() throws Exception {
        if(prototype) {
            test("account positive amounts and overdrafts", () -> {var a=new Exercise.BalanceAccount();eq(a.deposit(20),20L);yes(!a.withdraw(21));yes(a.withdraw(5));eq(a.balance(),15L);error(IllegalArgumentException.class,()->a.deposit(0));eq(a.balance(),15L);eq(new Exercise.BalanceAccount().balance(),0L);});
        } else {
            test("transfer conservation and original-result replay", () -> {var b=new Exercise.Bank();yes(b.createAccount("a"));yes(!b.createAccount("a"));b.createAccount("b");b.deposit("a",100);eq(b.transfer("r","a","b",30),new Exercise.TransferResult(70,30));b.deposit("a",9);eq(b.transfer("r","a","b",30),new Exercise.TransferResult(70,30));eq(b.balance("a")+b.balance("b"),109L);error(IllegalArgumentException.class,()->b.transfer("r","a","b",31));eq(b.balance("b"),30L);});
            test("failed IDs can be retried and validation precedes lookup", () -> {var b=new Exercise.Bank();b.createAccount("a");b.createAccount("b");eq(b.transfer("r","a","b",1),null);b.deposit("a",1);eq(b.transfer("r","a","b",1),new Exercise.TransferResult(0,1));error(IllegalArgumentException.class,()->b.deposit("missing",0));eq(b.balance("missing"),null);});
            test("ranking snapshots ties and independent banks", () -> {var b=new Exercise.Bank();b.createAccount("b");b.createAccount("a");eq(b.topSpenders(9),list(new Exercise.Spending("a",0),new Exercise.Spending("b",0)));b.topSpenders(9).clear();eq(b.topSpenders(9).size(),2);error(IllegalArgumentException.class,()->b.topSpenders(-1));eq(new Exercise.Bank().balance("a"),null);});
        }
    }
    public static void main(String[] args) throws Exception {
        String stage="final";
        if(args.length!=0) {
            if(args.length!=2 || !args[0].equals("--stage")) { System.err.println("Usage: java Main --stage prototype|final"); System.exit(2); }
            stage=args[1];
        }
        if(!stage.equals("prototype") && !stage.equals("final")) { System.err.println("Unknown stage: " + stage); System.exit(2); }
        prototype=stage.equals("prototype"); suites();
        System.out.println("RESULT stage="+stage+" passed="+passed+" failed="+failed);
        if(failed>0 || passed==0) System.exit(1);
    }
}
