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
        test("late cheaper path", () -> { int a0=3; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,4L),new Exercise.Edge(0,2,5L),new Exercise.Edge(2,1,-3L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,2L,5L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("unreachable negative cycle", () -> { int a0=4; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,2L),new Exercise.Edge(2,3,-2L),new Exercise.Edge(3,2,1L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,2L,(Long)null,(Long)null)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("one vertex", () -> { int a0=1; List<Exercise.Edge> a1=list(); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("negative-weight DAG 2", () -> { int a0=2; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,6L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,6L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("negative-weight DAG 3", () -> { int a0=3; List<Exercise.Edge> a1=list(new Exercise.Edge(1,2,7L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,(Long)null,(Long)null)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("negative-weight DAG 4", () -> { int a0=4; List<Exercise.Edge> a1=list(new Exercise.Edge(0,3,2L),new Exercise.Edge(2,3,-3L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,(Long)null,(Long)null,2L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("negative-weight DAG 5", () -> { int a0=5; List<Exercise.Edge> a1=list(new Exercise.Edge(0,2,5L),new Exercise.Edge(0,3,-3L),new Exercise.Edge(1,3,8L),new Exercise.Edge(2,4,-5L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,(Long)null,5L,-3L,0L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("negative-weight DAG 6", () -> { int a0=6; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,-2L),new Exercise.Edge(0,3,-2L),new Exercise.Edge(1,5,-2L),new Exercise.Edge(2,5,-1L),new Exercise.Edge(3,4,5L),new Exercise.Edge(3,5,-4L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,-2L,(Long)null,-2L,3L,-6L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("negative-weight DAG 7", () -> { int a0=7; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,1L),new Exercise.Edge(0,2,-4L),new Exercise.Edge(0,3,-5L),new Exercise.Edge(1,2,2L),new Exercise.Edge(1,3,0L),new Exercise.Edge(1,5,5L),new Exercise.Edge(1,6,7L),new Exercise.Edge(2,3,-2L),new Exercise.Edge(2,4,-5L),new Exercise.Edge(3,6,-4L),new Exercise.Edge(4,6,-3L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,1L,-4L,-6L,-9L,6L,-12L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("negative-weight DAG 8", () -> { int a0=8; List<Exercise.Edge> a1=list(new Exercise.Edge(1,2,8L),new Exercise.Edge(1,3,5L),new Exercise.Edge(2,6,6L),new Exercise.Edge(2,7,-4L),new Exercise.Edge(3,6,-1L),new Exercise.Edge(3,7,5L),new Exercise.Edge(4,7,2L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,(Long)null,(Long)null,(Long)null,(Long)null,(Long)null,(Long)null,(Long)null)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("negative-weight DAG 9", () -> { int a0=9; List<Exercise.Edge> a1=list(new Exercise.Edge(0,8,-3L),new Exercise.Edge(1,4,-3L),new Exercise.Edge(1,6,8L),new Exercise.Edge(1,7,-4L),new Exercise.Edge(1,8,-5L),new Exercise.Edge(2,3,-5L),new Exercise.Edge(2,4,-2L),new Exercise.Edge(2,5,-2L),new Exercise.Edge(3,5,2L),new Exercise.Edge(3,7,-4L),new Exercise.Edge(4,5,8L),new Exercise.Edge(4,6,2L),new Exercise.Edge(5,6,-2L),new Exercise.Edge(5,7,1L),new Exercise.Edge(6,7,7L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,(Long)null,(Long)null,(Long)null,(Long)null,(Long)null,(Long)null,(Long)null,-3L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("negative-weight DAG 10", () -> { int a0=10; List<Exercise.Edge> a1=list(new Exercise.Edge(0,4,2L),new Exercise.Edge(0,5,2L),new Exercise.Edge(0,6,-3L),new Exercise.Edge(0,9,8L),new Exercise.Edge(1,2,3L),new Exercise.Edge(1,3,-2L),new Exercise.Edge(1,8,1L),new Exercise.Edge(1,9,-1L),new Exercise.Edge(2,4,1L),new Exercise.Edge(2,8,8L),new Exercise.Edge(2,9,8L),new Exercise.Edge(3,5,2L),new Exercise.Edge(3,6,5L),new Exercise.Edge(3,7,-4L),new Exercise.Edge(3,8,-1L),new Exercise.Edge(4,8,5L),new Exercise.Edge(4,9,7L),new Exercise.Edge(5,7,2L),new Exercise.Edge(5,8,-4L),new Exercise.Edge(5,9,-5L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,(Long)null,(Long)null,(Long)null,2L,2L,-3L,4L,-2L,-3L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("reachable negative cycle", () -> { int a0=2; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,-1L),new Exercise.Edge(1,0,0L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2); }); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("negative self cycle", () -> { int a0=1; List<Exercise.Edge> a1=list(new Exercise.Edge(0,0,-1L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2); }); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { List<Exercise.Edge> a=new ArrayList<>();for(int i=1498;i>=0;i--)a.add(new Exercise.Edge(i,i+1,-1));var out=Exercise.solve(1500,a,0);eq(out.get(1499),-1499L); });
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
