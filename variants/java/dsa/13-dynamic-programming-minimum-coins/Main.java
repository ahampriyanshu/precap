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
        test("greedy counterexample", () -> { long[] a0=new long[]{1L,3L,4L}; int a1=6; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),2); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("unreachable", () -> { long[] a0=new long[]{4L,6L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),-1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("empty exact zero", () -> { long[] a0=new long[]{}; int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("no sizes", () -> { long[] a0=new long[]{}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),-1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("duplicate sizes", () -> { long[] a0=new long[]{2L,2L}; int a1=4; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),2); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 0", () -> { long[] a0=new long[]{2L,5L,3L}; int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 1", () -> { long[] a0=new long[]{6L,5L}; int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),-1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 2", () -> { long[] a0=new long[]{2L,3L,6L}; int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 3", () -> { long[] a0=new long[]{}; int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),-1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 4", () -> { long[] a0=new long[]{}; int a1=4; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),-1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 5", () -> { long[] a0=new long[]{1L,3L,6L}; int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 6", () -> { long[] a0=new long[]{1L,5L,6L}; int a1=6; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 7", () -> { long[] a0=new long[]{5L}; int a1=7; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),-1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 8", () -> { long[] a0=new long[]{1L,4L,6L}; int a1=8; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),2); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 9", () -> { long[] a0=new long[]{5L,1L}; int a1=9; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),5); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 10", () -> { long[] a0=new long[]{3L,2L,6L}; int a1=10; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 11", () -> { long[] a0=new long[]{}; int a1=11; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),-1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 12", () -> { long[] a0=new long[]{}; int a1=12; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),-1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 13", () -> { long[] a0=new long[]{3L,5L,6L}; int a1=13; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 14", () -> { long[] a0=new long[]{5L,1L}; int a1=14; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),6); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 15", () -> { long[] a0=new long[]{}; int a1=15; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),-1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 16", () -> { long[] a0=new long[]{5L,1L,6L}; int a1=16; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 17", () -> { long[] a0=new long[]{6L}; int a1=17; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),-1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 18", () -> { long[] a0=new long[]{3L,1L,5L}; int a1=18; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),4); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("target amount 19", () -> { long[] a0=new long[]{1L,2L}; int a1=19; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),10); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("invalid input", () -> { long[] a0=new long[]{0L}; int a1=3; String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("invalid input", () -> { long[] a0=new long[]{1L}; int a1=-1; String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { eq(Exercise.solve(new long[]{1,3,4},20000),5000); });
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
