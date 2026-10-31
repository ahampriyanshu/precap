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
            test("sorted remainder zero and input ownership", () -> {var members=list("c","a","b");eq(Exercise.splitEqual(5,members),map("a",2L,"b",2L,"c",1L));eq(Exercise.splitEqual(0,members),map("a",0L,"b",0L,"c",0L));eq(members,list("c","a","b"));error(IllegalArgumentException.class,()->Exercise.splitEqual(1,list("a","a")));error(IllegalArgumentException.class,()->Exercise.splitEqual(-1,list("a")));});
        } else {
            test("expense cent conservation and canonical retries", () -> {var e=new Exercise.ExpenseSharing(list("a","b","c"));yes(e.addExpense("x","a",5,list("c","b","a")));eq(e.balances(),map("a",3L,"b",-2L,"c",-1L));yes(!e.addExpense("x","a",5,list("a","b","c")));error(IllegalArgumentException.class,()->e.addExpense("x","a",6,list("a","b","c")));eq(e.balances().values().stream().mapToLong(Long::longValue).sum(),0L);});
            test("bounded settlements replay before balance checks shared IDs", () -> {var e=new Exercise.ExpenseSharing(list("a","b"));e.addExpense("x","a",10,list("b"));yes(e.settle("s","b","a",10));yes(!e.settle("s","b","a",10));error(IllegalArgumentException.class,()->e.settle("x","b","a",1));error(IllegalArgumentException.class,()->e.settle("bad","b","a",1));e.addExpense("new","a",2,list("b"));yes(e.settle("bad","b","a",1));eq(e.balances(),map("a",1L,"b",-1L));});
            test("deterministic suggestions snapshots and no mutation", () -> {var e=new Exercise.ExpenseSharing(list("d","c","b","a"));e.addExpense("x","c",6,list("a","b"));e.addExpense("y","d",2,list("a"));var before=e.balances();eq(e.suggestSettlements(),list(new Exercise.Settlement("a","c",5),new Exercise.Settlement("b","c",1),new Exercise.Settlement("b","d",2)));eq(e.balances(),before);e.balances().clear();e.suggestSettlements().clear();eq(e.balances(),before);eq(new Exercise.ExpenseSharing(list("a")).balances(),map("a",0L));});
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
