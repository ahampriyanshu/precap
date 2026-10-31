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
        test("no self pairing", () -> { long[] a0=new long[]{5L}; long a1=10L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),null); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("two equal values", () -> { long[] a0=new long[]{5L,5L}; long a1=10L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(5L,5L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("canonical tie", () -> { long[] a0=new long[]{4L,1L,3L,2L}; long a1=5L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(1L,4L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("empty", () -> { long[] a0=new long[]{}; long a1=0L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),null); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("negative adjustment", () -> { long[] a0=new long[]{-4L,0L,4L}; long a1=0L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-4L,4L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 0", () -> { long[] a0=new long[]{}; long a1=5L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),null); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 1", () -> { long[] a0=new long[]{-6L}; long a1=6L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),null); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 2", () -> { long[] a0=new long[]{2L,1L}; long a1=-5L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),null); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 3", () -> { long[] a0=new long[]{-1L,3L,3L}; long a1=1L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),null); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 4", () -> { long[] a0=new long[]{7L,5L,-2L,-4L}; long a1=2L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),null); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 5", () -> { long[] a0=new long[]{7L,4L,-3L,-4L,3L}; long a1=0L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-4L,4L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 6", () -> { long[] a0=new long[]{-3L,2L,3L,2L,-5L,4L}; long a1=-2L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-5L,3L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 7", () -> { long[] a0=new long[]{1L,5L,-5L,-5L,6L,2L,-4L}; long a1=4L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),null); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 8", () -> { long[] a0=new long[]{3L,0L,3L,6L,0L,-2L,-4L,1L}; long a1=0L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(0L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 9", () -> { long[] a0=new long[]{-5L,6L,-3L,-3L,6L,7L,6L,-1L,5L}; long a1=5L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-1L,6L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 10", () -> { long[] a0=new long[]{2L,3L,-2L,1L,6L,3L,6L,4L,0L,-1L}; long a1=0L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-2L,2L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 11", () -> { long[] a0=new long[]{4L,0L,0L,7L,1L,3L,0L,0L,0L,4L,-2L}; long a1=1L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-2L,3L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 12", () -> { long[] a0=new long[]{2L,6L,2L,-4L,6L,7L,-1L,3L,-3L,-3L,-3L,5L}; long a1=-2L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-4L,2L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 13", () -> { long[] a0=new long[]{-1L,2L,-4L,-1L,1L,-6L,1L,5L,4L,-2L,6L,5L,-5L}; long a1=7L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(1L,6L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 14", () -> { long[] a0=new long[]{7L,2L,1L,-3L,5L,6L,-2L,7L,1L,-1L,4L,3L,-1L,1L}; long a1=-4L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-3L,-1L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 15", () -> { long[] a0=new long[]{-3L,3L,0L,-2L,-5L,-4L,-1L,-2L,6L,0L,4L,3L,-3L,-6L,3L}; long a1=3L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-3L,6L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 16", () -> { long[] a0=new long[]{5L,-1L,-2L,-1L,7L,3L,4L,-4L,1L,-1L,-3L,-5L,-3L,-1L,5L,-3L}; long a1=-2L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-5L,3L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 17", () -> { long[] a0=new long[]{6L,3L,-5L,-4L,6L,0L,2L,3L,4L,7L,5L,-1L,-4L,1L,-1L,-5L,5L}; long a1=5L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-1L,6L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 18", () -> { long[] a0=new long[]{-6L,7L,5L,7L,7L,7L,-1L,4L,5L,-3L,-1L,-2L,5L,-1L,-3L,4L,6L,4L}; long a1=6L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-1L,7L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 19", () -> { long[] a0=new long[]{5L,-5L,-3L,2L,7L,-4L,-2L,5L,4L,4L,-1L,4L,7L,3L,0L,7L,-4L,-3L,3L}; long a1=-1L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-5L,4L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 20", () -> { long[] a0=new long[]{7L,7L,2L,7L,-6L,2L,5L,-6L,-3L,3L,-6L,-6L,-2L,-2L,2L,6L,-4L,-2L,-1L,-1L}; long a1=-4L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-6L,2L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 21", () -> { long[] a0=new long[]{-6L,-2L,3L,5L,5L,2L,5L,1L,5L,-3L,2L,6L,-1L,-1L,1L,4L,0L,2L,1L,2L,-2L}; long a1=-5L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-6L,1L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 22", () -> { long[] a0=new long[]{0L,-3L,2L,-4L,-1L,-5L,-5L,1L,5L,7L,1L,7L,0L,5L,-6L,1L,-1L,4L,2L,-4L,6L,2L}; long a1=-5L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-6L,1L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 23", () -> { long[] a0=new long[]{3L,-5L,-3L,-5L,0L,-5L,3L,4L,-6L,-3L,-4L,2L,-4L,-5L,2L,-4L,1L,5L,0L,2L,-3L,5L,4L}; long a1=-2L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(-6L,4L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated pair 24", () -> { long[] a0=new long[]{6L,2L,-6L,-3L,2L,-5L,6L,5L,0L,-2L,3L,0L,-6L,6L,-1L,2L,4L,0L,-3L,-4L,-6L,3L,-6L,-1L}; long a1=6L; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Pair(0L,6L)); } finally { eq(show(new Object[]{a0,a1}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { long[] a=new long[20000];for(int i=0;i<a.length;i++)a[i]=a.length-1-i;eq(Exercise.solve(a,19999),new Exercise.Pair(0,19999)); });
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
