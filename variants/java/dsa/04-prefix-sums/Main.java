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
        test("correction and empty range", () -> { long[] a0=new long[]{4L,-2L,7L}; List<Exercise.Range> a1=list(new Exercise.Range(0,3),new Exercise.Range(1,3),new Exercise.Range(2,2)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(9L,5L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("empty values", () -> { long[] a0=new long[]{}; List<Exercise.Range> a1=list(new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 1", () -> { long[] a0=new long[]{-4L}; List<Exercise.Range> a1=list(new Exercise.Range(0,1),new Exercise.Range(0,1),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-4L,-4L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 2", () -> { long[] a0=new long[]{-5L,-5L}; List<Exercise.Range> a1=list(new Exercise.Range(0,2),new Exercise.Range(1,2),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-10L,-5L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 3", () -> { long[] a0=new long[]{4L,7L,6L}; List<Exercise.Range> a1=list(new Exercise.Range(0,3),new Exercise.Range(1,3),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(17L,13L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 4", () -> { long[] a0=new long[]{2L,0L,1L,4L}; List<Exercise.Range> a1=list(new Exercise.Range(0,4),new Exercise.Range(2,4),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(7L,5L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 5", () -> { long[] a0=new long[]{-5L,5L,-3L,-2L,-9L}; List<Exercise.Range> a1=list(new Exercise.Range(0,5),new Exercise.Range(2,5),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-14L,-14L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 6", () -> { long[] a0=new long[]{6L,5L,-2L,-5L,4L,2L}; List<Exercise.Range> a1=list(new Exercise.Range(0,6),new Exercise.Range(3,6),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(10L,1L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 7", () -> { long[] a0=new long[]{3L,-5L,-6L,-4L,-8L,9L,0L}; List<Exercise.Range> a1=list(new Exercise.Range(0,7),new Exercise.Range(3,7),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-11L,-3L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 8", () -> { long[] a0=new long[]{-9L,0L,1L,-7L,-7L,-2L,-9L,-7L}; List<Exercise.Range> a1=list(new Exercise.Range(0,8),new Exercise.Range(4,8),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-40L,-25L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 9", () -> { long[] a0=new long[]{-7L,5L,5L,-2L,0L,7L,0L,-1L,7L}; List<Exercise.Range> a1=list(new Exercise.Range(0,9),new Exercise.Range(4,9),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(14L,13L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 10", () -> { long[] a0=new long[]{-9L,-2L,-4L,3L,-1L,-3L,-5L,3L,5L,-3L}; List<Exercise.Range> a1=list(new Exercise.Range(0,10),new Exercise.Range(5,10),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-16L,-3L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 11", () -> { long[] a0=new long[]{-9L,9L,-8L,1L,-1L,-1L,-2L,-9L,-1L,0L,0L}; List<Exercise.Range> a1=list(new Exercise.Range(0,11),new Exercise.Range(5,11),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-21L,-13L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 12", () -> { long[] a0=new long[]{-8L,3L,-2L,-8L,8L,-2L,-8L,-9L,-2L,9L,-8L,3L}; List<Exercise.Range> a1=list(new Exercise.Range(0,12),new Exercise.Range(6,12),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-24L,-15L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 13", () -> { long[] a0=new long[]{6L,2L,7L,5L,-9L,-8L,-2L,4L,3L,3L,8L,-3L,-9L}; List<Exercise.Range> a1=list(new Exercise.Range(0,13),new Exercise.Range(6,13),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(7L,4L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 14", () -> { long[] a0=new long[]{-1L,-1L,-4L,1L,-8L,-3L,-6L,8L,-2L,2L,2L,-4L,-8L,-8L}; List<Exercise.Range> a1=list(new Exercise.Range(0,14),new Exercise.Range(7,14),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-32L,-10L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 15", () -> { long[] a0=new long[]{-8L,-1L,6L,-2L,-1L,4L,8L,-8L,-9L,3L,-5L,-6L,2L,-4L,-4L}; List<Exercise.Range> a1=list(new Exercise.Range(0,15),new Exercise.Range(7,15),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-25L,-31L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 16", () -> { long[] a0=new long[]{-5L,-9L,-1L,1L,-1L,-9L,-6L,6L,2L,0L,-6L,9L,-2L,7L,-1L,8L}; List<Exercise.Range> a1=list(new Exercise.Range(0,16),new Exercise.Range(8,16),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-7L,17L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 17", () -> { long[] a0=new long[]{-1L,-7L,-3L,-5L,6L,6L,-6L,7L,-7L,5L,1L,-8L,7L,-4L,-8L,2L,5L}; List<Exercise.Range> a1=list(new Exercise.Range(0,17),new Exercise.Range(8,17),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-10L,-7L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 18", () -> { long[] a0=new long[]{4L,7L,3L,6L,0L,-1L,-7L,-1L,-9L,-1L,1L,-4L,2L,-5L,9L,-2L,-7L,3L}; List<Exercise.Range> a1=list(new Exercise.Range(0,18),new Exercise.Range(9,18),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(-2L,-4L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated range 19", () -> { long[] a0=new long[]{9L,-1L,0L,-3L,6L,-3L,8L,0L,-5L,-1L,9L,3L,5L,1L,-4L,-3L,2L,0L,-8L}; List<Exercise.Range> a1=list(new Exercise.Range(0,19),new Exercise.Range(9,19),new Exercise.Range(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(15L,4L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("right out of bounds", () -> { long[] a0=new long[]{1L}; List<Exercise.Range> a1=list(new Exercise.Range(0,2)); String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("reversed", () -> { long[] a0=new long[]{1L}; List<Exercise.Range> a1=list(new Exercise.Range(1,0)); String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("negative index", () -> { long[] a0=new long[]{1L}; List<Exercise.Range> a1=list(new Exercise.Range(-1,0)); String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { long[] a=new long[10000];for(int i=0;i<a.length;i++)a[i]=i;List<Exercise.Range> q=new ArrayList<>();for(int i=0;i<1000;i++)q.add(new Exercise.Range(0,10000));var out=Exercise.solve(a,q);eq(out.size(),1000);for(Long n:out)eq(n,49995000L); });
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
