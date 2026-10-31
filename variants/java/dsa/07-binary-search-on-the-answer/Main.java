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
        test("order-sensitive boundary", () -> { long[] a0=new long[]{1L,2L,3L,4L,5L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),6L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("large answer space", () -> { long[] a0=new long[]{1000000000000L,1000000000000L}; int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),1000000000000L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("empty weights", () -> { long[] a0=new long[]{}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("extra days", () -> { long[] a0=new long[]{8L,2L}; int a1=9; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),8L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 1", () -> { long[] a0=new long[]{6L}; int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),6L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 2", () -> { long[] a0=new long[]{3L,7L}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),10L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 3", () -> { long[] a0=new long[]{5L,6L,5L}; int a1=7; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),6L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 4", () -> { long[] a0=new long[]{3L,8L,6L,1L}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),18L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 5", () -> { long[] a0=new long[]{3L,6L,11L,7L,8L}; int a1=4; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),11L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 6", () -> { long[] a0=new long[]{2L,11L,4L,1L,2L,10L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),13L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 7", () -> { long[] a0=new long[]{3L,11L,6L,11L,3L,3L,10L}; int a1=4; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),14L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 8", () -> { long[] a0=new long[]{4L,9L,7L,11L,10L,6L,8L,2L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),16L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 9", () -> { long[] a0=new long[]{10L,10L,7L,4L,11L,2L,8L,6L,8L}; int a1=6; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),14L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 10", () -> { long[] a0=new long[]{11L,3L,7L,7L,5L,5L,7L,3L,7L,11L}; int a1=6; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),12L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 11", () -> { long[] a0=new long[]{4L,11L,9L,7L,11L,10L,3L,2L,3L,7L,10L}; int a1=4; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),24L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 12", () -> { long[] a0=new long[]{2L,4L,6L,7L,3L,7L,8L,6L,8L,9L,6L,7L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),29L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 13", () -> { long[] a0=new long[]{7L,10L,11L,7L,1L,5L,6L,9L,4L,2L,6L,4L,5L}; int a1=4; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),21L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 14", () -> { long[] a0=new long[]{6L,9L,11L,8L,9L,11L,7L,7L,3L,4L,4L,1L,6L,8L}; int a1=6; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),18L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 15", () -> { long[] a0=new long[]{8L,5L,11L,7L,6L,9L,10L,8L,4L,5L,1L,8L,5L,3L,7L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),33L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 16", () -> { long[] a0=new long[]{7L,6L,5L,11L,6L,10L,7L,9L,3L,2L,6L,5L,3L,2L,2L,1L}; int a1=7; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),16L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("capacity sample 17", () -> { long[] a0=new long[]{4L,3L,2L,11L,1L,9L,5L,4L,4L,6L,10L,3L,3L,9L,2L,2L,7L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),20L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("invalid input", () -> { long[] a0=new long[]{1L}; int a1=0; String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("invalid input", () -> { long[] a0=new long[]{0L}; int a1=1; String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { long[] a=new long[10000];Arrays.fill(a,3);eq(Exercise.solve(a,5000),6L); });
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
