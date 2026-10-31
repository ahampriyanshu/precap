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
        test("first maximum wins", () -> { long[] a0=new long[]{8L,2L,8L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(18L,0)); } finally { eq(show(new Object[]{a0}),before); } });
        test("empty input", () -> { long[] a0=new long[]{}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(0L,null)); } finally { eq(show(new Object[]{a0}),before); } });
        test("one zero", () -> { long[] a0=new long[]{0L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(0L,0)); } finally { eq(show(new Object[]{a0}),before); } });
        test("wide arithmetic beyond int", () -> { long[] a0=new long[]{1000000000000L,1L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(1000000000001L,0)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 2", () -> { long[] a0=new long[]{2L,6L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(8L,1)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 3", () -> { long[] a0=new long[]{10L,11L,15L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(36L,2)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 4", () -> { long[] a0=new long[]{21L,28L,6L,24L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(79L,1)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 5", () -> { long[] a0=new long[]{14L,21L,9L,27L,17L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(88L,3)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 6", () -> { long[] a0=new long[]{13L,9L,3L,23L,19L,7L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(74L,3)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 7", () -> { long[] a0=new long[]{27L,23L,9L,16L,20L,5L,9L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(109L,0)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 8", () -> { long[] a0=new long[]{21L,22L,28L,29L,22L,29L,3L,16L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(170L,3)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 9", () -> { long[] a0=new long[]{7L,15L,15L,28L,25L,26L,0L,28L,23L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(167L,3)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 10", () -> { long[] a0=new long[]{20L,29L,22L,16L,9L,24L,5L,28L,28L,23L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(204L,1)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 11", () -> { long[] a0=new long[]{28L,19L,19L,2L,18L,13L,13L,4L,24L,26L,20L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(186L,0)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 12", () -> { long[] a0=new long[]{16L,11L,6L,5L,0L,5L,20L,11L,6L,20L,28L,12L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(140L,10)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 13", () -> { long[] a0=new long[]{14L,2L,12L,23L,10L,28L,15L,23L,14L,5L,11L,0L,11L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(168L,5)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 14", () -> { long[] a0=new long[]{25L,25L,18L,5L,17L,25L,5L,4L,12L,3L,12L,29L,27L,26L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(233L,11)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 15", () -> { long[] a0=new long[]{29L,20L,3L,18L,18L,23L,0L,15L,24L,25L,25L,28L,27L,6L,4L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(265L,0)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 16", () -> { long[] a0=new long[]{27L,17L,6L,7L,9L,16L,28L,15L,7L,27L,13L,16L,9L,6L,15L,13L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(231L,6)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 17", () -> { long[] a0=new long[]{2L,4L,0L,5L,26L,22L,3L,12L,12L,18L,18L,3L,4L,1L,21L,4L,25L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(180L,4)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 18", () -> { long[] a0=new long[]{8L,0L,29L,2L,28L,8L,0L,24L,1L,8L,13L,2L,26L,5L,6L,20L,16L,2L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(198L,2)); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated length 19", () -> { long[] a0=new long[]{29L,6L,10L,9L,0L,8L,4L,27L,16L,0L,19L,3L,8L,16L,8L,16L,17L,13L,13L}; String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),new Exercise.Scan(222L,0)); } finally { eq(show(new Object[]{a0}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { long[] a=new long[100000];Arrays.fill(a,7);eq(Exercise.solve(a),new Exercise.Scan(700000,0)); });
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
