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
        test("expiring descending maximum", () -> { long[] a0=new long[]{9L,8L,7L,6L}; int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(9L,8L,7L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("duplicate peak", () -> { long[] a0=new long[]{4L,4L,1L,4L}; int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(4L,4L,4L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("empty", () -> { long[] a0=new long[]{}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("no full window", () -> { long[] a0=new long[]{1L}; int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=1 w=1", () -> { long[] a0=new long[]{0L}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=1 w=3", () -> { long[] a0=new long[]{-9L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=1 w=5", () -> { long[] a0=new long[]{-6L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=2 w=1", () -> { long[] a0=new long[]{9L,-3L}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(9L,-3L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=2 w=3", () -> { long[] a0=new long[]{-2L,-10L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=2 w=5", () -> { long[] a0=new long[]{-9L,5L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=3 w=1", () -> { long[] a0=new long[]{-4L,10L,7L}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-4L,10L,7L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=3 w=3", () -> { long[] a0=new long[]{1L,10L,-6L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(10L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=3 w=5", () -> { long[] a0=new long[]{-9L,1L,0L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=4 w=1", () -> { long[] a0=new long[]{-5L,-4L,5L,-6L}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-5L,-4L,5L,-6L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=4 w=3", () -> { long[] a0=new long[]{1L,-7L,2L,1L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(2L,2L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=4 w=5", () -> { long[] a0=new long[]{8L,3L,-7L,5L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=5 w=1", () -> { long[] a0=new long[]{-8L,-4L,-5L,6L,0L}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-8L,-4L,-5L,6L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=5 w=3", () -> { long[] a0=new long[]{7L,6L,-7L,1L,-2L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(7L,6L,1L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=5 w=5", () -> { long[] a0=new long[]{-5L,9L,9L,2L,-9L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(9L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=6 w=1", () -> { long[] a0=new long[]{-6L,10L,-10L,6L,4L,-7L}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-6L,10L,-10L,6L,4L,-7L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=6 w=3", () -> { long[] a0=new long[]{-8L,-8L,3L,-4L,-4L,-7L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(3L,3L,3L,-4L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=6 w=5", () -> { long[] a0=new long[]{3L,5L,10L,-1L,5L,7L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(10L,10L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=7 w=1", () -> { long[] a0=new long[]{1L,-3L,-6L,1L,6L,5L,7L}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(1L,-3L,-6L,1L,6L,5L,7L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=7 w=3", () -> { long[] a0=new long[]{7L,6L,4L,-3L,-4L,-5L,1L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(7L,6L,4L,-3L,1L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=7 w=5", () -> { long[] a0=new long[]{6L,-6L,-5L,10L,-9L,10L,-3L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(10L,10L,10L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=8 w=1", () -> { long[] a0=new long[]{-5L,-10L,-5L,-6L,2L,0L,5L,7L}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-5L,-10L,-5L,-6L,2L,0L,5L,7L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=8 w=3", () -> { long[] a0=new long[]{5L,-6L,-10L,-3L,-9L,2L,-4L,2L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(5L,-3L,-3L,2L,2L,2L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=8 w=5", () -> { long[] a0=new long[]{-8L,-3L,-9L,-10L,-9L,6L,5L,-6L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-3L,6L,6L,6L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=9 w=1", () -> { long[] a0=new long[]{9L,-8L,6L,-2L,3L,-9L,-9L,1L,5L}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(9L,-8L,6L,-2L,3L,-9L,-9L,1L,5L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=9 w=3", () -> { long[] a0=new long[]{-10L,1L,-6L,-9L,-10L,9L,-7L,-9L,-10L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(1L,1L,-6L,9L,9L,9L,-7L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=9 w=5", () -> { long[] a0=new long[]{-7L,-2L,2L,9L,-7L,-9L,-2L,-4L,-10L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(9L,9L,9L,9L,-2L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=10 w=1", () -> { long[] a0=new long[]{-2L,7L,-9L,-7L,-3L,5L,6L,6L,-8L,7L}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-2L,7L,-9L,-7L,-3L,5L,6L,6L,-8L,7L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=10 w=3", () -> { long[] a0=new long[]{-3L,0L,-10L,-2L,-5L,4L,10L,-3L,3L,-1L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0L,0L,-2L,4L,10L,10L,10L,3L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=10 w=5", () -> { long[] a0=new long[]{8L,0L,7L,9L,10L,-10L,9L,-3L,9L,7L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(10L,10L,10L,10L,10L,9L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=11 w=1", () -> { long[] a0=new long[]{9L,-8L,7L,9L,-6L,-8L,8L,-2L,-10L,10L,-4L}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(9L,-8L,7L,9L,-6L,-8L,8L,-2L,-10L,10L,-4L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=11 w=3", () -> { long[] a0=new long[]{6L,5L,-6L,-9L,-5L,-9L,-10L,2L,7L,8L,-4L}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(6L,5L,-5L,-5L,-5L,2L,7L,8L,8L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("peak n=11 w=5", () -> { long[] a0=new long[]{-2L,-10L,-3L,0L,-4L,-3L,-9L,4L,3L,-4L,8L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0L,0L,0L,4L,4L,4L,8L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("invalid input", () -> { long[] a0=new long[]{1L}; int a1=0; String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { long[] a=new long[10000];for(int i=0;i<a.length;i++)a[i]=i;var out=Exercise.solve(a,500);eq(out.size(),9501);eq(out.get(0),499L);eq(out.get(9500),9999L); });
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
