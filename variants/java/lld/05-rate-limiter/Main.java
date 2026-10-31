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
            test("exact boundary and overfull history", () -> {var r=list(0L,1L,1L);eq(Exercise.allowRequest(r,2,2,2),new Exercise.Decision(false,list(1L,1L)));eq(r,list(0L,1L,1L));eq(Exercise.allowRequest(list(0L),1,2,2),new Exercise.Decision(true,list(2L)));});
            test("history validation", () -> {error(IllegalArgumentException.class,()->Exercise.allowRequest(list(2L,1L),2,5,3));error(IllegalArgumentException.class,()->Exercise.allowRequest(list(4L),2,5,3));error(IllegalArgumentException.class,()->Exercise.allowRequest(list(),0,5,0));});
        } else {
            test("denial clocks boundaries and client isolation", () -> {var l=new Exercise.SlidingWindowLimiter(1,3);yes(l.allow("a",0));yes(!l.allow("a",2));error(IllegalArgumentException.class,()->l.allow("a",1));eq(l.history("a"),list(0L));yes(l.allow("b",0));yes(l.allow("a",3));eq(l.history("a"),list(3L));});
            test("history snapshots and no passive expiration", () -> {var l=new Exercise.SlidingWindowLimiter(2,5);l.allow("a",1);l.allow("b",100);eq(l.history("a"),list(1L));l.history("a").clear();eq(l.history("a"),list(1L));eq(l.history("new"),list());eq(new Exercise.SlidingWindowLimiter(1,1).history("a"),list());});
            test("invalid settings and calls are atomic", () -> {error(IllegalArgumentException.class,()->new Exercise.SlidingWindowLimiter(0,1));var l=new Exercise.SlidingWindowLimiter(1,1);error(IllegalArgumentException.class,()->l.allow("",5));yes(l.allow("a",0));error(IllegalArgumentException.class,()->l.allow("a",-1));eq(l.history("a"),list(0L));});
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
