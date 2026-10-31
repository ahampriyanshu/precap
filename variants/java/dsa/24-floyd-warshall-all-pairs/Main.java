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
        test("parallel edges and ordered intermediates", () -> { int a0=4; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,7L),new Exercise.Edge(0,1,3L),new Exercise.Edge(1,2,-1L),new Exercise.Edge(2,3,2L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(list(0L,3L,2L,4L),list((Long)null,0L,-1L,1L),list((Long)null,(Long)null,0L,2L),list((Long)null,(Long)null,(Long)null,0L))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("wrong loop order misses this route", () -> { int a0=4; List<Exercise.Edge> a1=list(new Exercise.Edge(0,3,1L),new Exercise.Edge(3,2,1L),new Exercise.Edge(2,1,1L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(list(0L,3L,2L,1L),list((Long)null,0L,(Long)null,(Long)null),list((Long)null,1L,0L,(Long)null),list((Long)null,2L,1L,0L))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("unreachable pairs and diagonal", () -> { int a0=2; List<Exercise.Edge> a1=list(); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(list(0L,(Long)null),list((Long)null,0L))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("empty graph", () -> { int a0=0; List<Exercise.Edge> a1=list(); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("all-pairs DAG 1", () -> { int a0=1; List<Exercise.Edge> a1=list(); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(list(0L))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("all-pairs DAG 2", () -> { int a0=2; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,-2L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(list(0L,-2L),list((Long)null,0L))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("all-pairs DAG 3", () -> { int a0=3; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,4L),new Exercise.Edge(0,2,-2L),new Exercise.Edge(1,2,-1L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(list(0L,4L,-2L),list((Long)null,0L,-1L),list((Long)null,(Long)null,0L))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("all-pairs DAG 4", () -> { int a0=4; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,-1L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(list(0L,-1L,(Long)null,(Long)null),list((Long)null,0L,(Long)null,(Long)null),list((Long)null,(Long)null,0L,(Long)null),list((Long)null,(Long)null,(Long)null,0L))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("all-pairs DAG 5", () -> { int a0=5; List<Exercise.Edge> a1=list(new Exercise.Edge(0,4,-1L),new Exercise.Edge(1,2,6L),new Exercise.Edge(1,3,7L),new Exercise.Edge(1,4,0L),new Exercise.Edge(2,4,3L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(list(0L,(Long)null,(Long)null,(Long)null,-1L),list((Long)null,0L,6L,7L,0L),list((Long)null,(Long)null,0L,(Long)null,3L),list((Long)null,(Long)null,(Long)null,0L,(Long)null),list((Long)null,(Long)null,(Long)null,(Long)null,0L))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("all-pairs DAG 6", () -> { int a0=6; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,4L),new Exercise.Edge(0,2,-1L),new Exercise.Edge(0,3,1L),new Exercise.Edge(0,5,7L),new Exercise.Edge(2,5,5L),new Exercise.Edge(3,4,4L),new Exercise.Edge(4,5,6L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(list(0L,4L,-1L,1L,5L,4L),list((Long)null,0L,(Long)null,(Long)null,(Long)null,(Long)null),list((Long)null,(Long)null,0L,(Long)null,(Long)null,5L),list((Long)null,(Long)null,(Long)null,0L,4L,10L),list((Long)null,(Long)null,(Long)null,(Long)null,0L,6L),list((Long)null,(Long)null,(Long)null,(Long)null,(Long)null,0L))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("all-pairs DAG 7", () -> { int a0=7; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,2L),new Exercise.Edge(0,2,7L),new Exercise.Edge(0,3,5L),new Exercise.Edge(0,4,6L),new Exercise.Edge(1,3,2L),new Exercise.Edge(1,4,2L),new Exercise.Edge(1,5,0L),new Exercise.Edge(1,6,4L),new Exercise.Edge(2,4,7L),new Exercise.Edge(3,4,2L),new Exercise.Edge(3,6,2L),new Exercise.Edge(4,5,7L),new Exercise.Edge(5,6,0L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(list(0L,2L,7L,4L,4L,2L,2L),list((Long)null,0L,(Long)null,2L,2L,0L,0L),list((Long)null,(Long)null,0L,(Long)null,7L,14L,14L),list((Long)null,(Long)null,(Long)null,0L,2L,9L,2L),list((Long)null,(Long)null,(Long)null,(Long)null,0L,7L,7L),list((Long)null,(Long)null,(Long)null,(Long)null,(Long)null,0L,0L),list((Long)null,(Long)null,(Long)null,(Long)null,(Long)null,(Long)null,0L))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("all-pairs DAG 8", () -> { int a0=8; List<Exercise.Edge> a1=list(new Exercise.Edge(0,2,2L),new Exercise.Edge(0,3,3L),new Exercise.Edge(0,4,4L),new Exercise.Edge(0,5,2L),new Exercise.Edge(0,7,2L),new Exercise.Edge(1,2,0L),new Exercise.Edge(1,3,-2L),new Exercise.Edge(1,5,0L),new Exercise.Edge(1,6,1L),new Exercise.Edge(1,7,-2L),new Exercise.Edge(2,3,5L),new Exercise.Edge(2,4,4L),new Exercise.Edge(2,6,4L),new Exercise.Edge(3,4,3L),new Exercise.Edge(3,6,3L),new Exercise.Edge(4,6,2L),new Exercise.Edge(5,6,1L),new Exercise.Edge(5,7,0L),new Exercise.Edge(6,7,4L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(list(0L,(Long)null,2L,3L,4L,2L,3L,2L),list((Long)null,0L,0L,-2L,1L,0L,1L,-2L),list((Long)null,(Long)null,0L,5L,4L,(Long)null,4L,8L),list((Long)null,(Long)null,(Long)null,0L,3L,(Long)null,3L,7L),list((Long)null,(Long)null,(Long)null,(Long)null,0L,(Long)null,2L,6L),list((Long)null,(Long)null,(Long)null,(Long)null,(Long)null,0L,1L,0L),list((Long)null,(Long)null,(Long)null,(Long)null,(Long)null,(Long)null,0L,4L),list((Long)null,(Long)null,(Long)null,(Long)null,(Long)null,(Long)null,(Long)null,0L))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("negative cycle anywhere", () -> { int a0=2; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,-2L),new Exercise.Edge(1,0,1L)); String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { List<Exercise.Edge> a=new ArrayList<>();for(int i=0;i<79;i++)a.add(new Exercise.Edge(i,i+1,1));var out=Exercise.solve(80,a);eq(out.size(),80);eq(out.get(0).get(79),79L);eq(out.get(79).get(0),null);eq(out.get(79).get(79),0L); });
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
