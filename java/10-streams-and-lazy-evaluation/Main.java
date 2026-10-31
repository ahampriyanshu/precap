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
            test("first positive encounter order and empty", () -> {var a=list(-1,0,3,2);eq(Exercise.firstPositive(a),OptionalInt.of(3));eq(a,list(-1,0,3,2));eq(Exercise.firstPositive(list(-2,0)),OptionalInt.empty());eq(Exercise.firstPositive(list()),OptionalInt.empty());});
        } else {
            test("short circuit exact visits ordered result and close", () -> {var visits=new java.util.concurrent.atomic.AtomicInteger();var closes=new java.util.concurrent.atomic.AtomicInteger();var s=java.util.stream.Stream.of(1,2,3,4).parallel().onClose(closes::incrementAndGet);eq(Exercise.firstMatching(s,x->{visits.incrementAndGet();return x>=2;}),OptionalInt.of(2));eq(visits.get(),2);eq(closes.get(),1);});
            test("exhaustion closes and exception identity", () -> {var closes=new java.util.concurrent.atomic.AtomicInteger();eq(Exercise.firstMatching(java.util.stream.Stream.<Integer>empty().onClose(closes::incrementAndGet),x->true),OptionalInt.empty());eq(closes.get(),1);var failure=new IllegalStateException("same");try{Exercise.firstMatching(java.util.stream.Stream.of(1).onClose(closes::incrementAndGet),x->{throw failure;});throw new AssertionError();}catch(IllegalStateException e){yes(e==failure);}eq(closes.get(),2);});
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
