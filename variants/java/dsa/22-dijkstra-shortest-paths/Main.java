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
        test("discovery is not finalization", () -> { int a0=4; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,10L),new Exercise.Edge(0,2,1L),new Exercise.Edge(2,1,1L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,2L,1L,(Long)null)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("zero cycle and stale entry", () -> { int a0=3; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,0L),new Exercise.Edge(1,0,0L),new Exercise.Edge(1,2,2L),new Exercise.Edge(0,2,9L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,0L,2L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("weighted graph 1", () -> { int a0=1; List<Exercise.Edge> a1=list(); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("weighted graph 2", () -> { int a0=2; List<Exercise.Edge> a1=list(); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,(Long)null)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("weighted graph 3", () -> { int a0=3; List<Exercise.Edge> a1=list(new Exercise.Edge(2,1,2L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,(Long)null,(Long)null)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("weighted graph 4", () -> { int a0=4; List<Exercise.Edge> a1=list(new Exercise.Edge(2,1,2L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,(Long)null,(Long)null,(Long)null)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("weighted graph 5", () -> { int a0=5; List<Exercise.Edge> a1=list(new Exercise.Edge(0,0,7L),new Exercise.Edge(4,0,8L),new Exercise.Edge(4,1,0L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,(Long)null,(Long)null,(Long)null,(Long)null)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("weighted graph 6", () -> { int a0=6; List<Exercise.Edge> a1=list(new Exercise.Edge(2,1,8L),new Exercise.Edge(2,3,7L),new Exercise.Edge(3,0,6L),new Exercise.Edge(4,0,1L),new Exercise.Edge(4,2,7L),new Exercise.Edge(5,0,1L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,(Long)null,(Long)null,(Long)null,(Long)null,(Long)null)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("weighted graph 7", () -> { int a0=7; List<Exercise.Edge> a1=list(new Exercise.Edge(1,4,5L),new Exercise.Edge(1,5,1L),new Exercise.Edge(2,3,0L),new Exercise.Edge(2,6,7L),new Exercise.Edge(3,3,4L),new Exercise.Edge(6,2,2L),new Exercise.Edge(6,3,0L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,(Long)null,(Long)null,(Long)null,(Long)null,(Long)null,(Long)null)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("weighted graph 8", () -> { int a0=8; List<Exercise.Edge> a1=list(new Exercise.Edge(0,3,0L),new Exercise.Edge(0,4,6L),new Exercise.Edge(1,0,2L),new Exercise.Edge(1,4,3L),new Exercise.Edge(1,5,5L),new Exercise.Edge(1,7,7L),new Exercise.Edge(4,6,1L),new Exercise.Edge(4,7,6L),new Exercise.Edge(5,0,0L),new Exercise.Edge(5,1,6L),new Exercise.Edge(5,4,0L),new Exercise.Edge(5,5,2L),new Exercise.Edge(7,6,8L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,(Long)null,(Long)null,0L,6L,(Long)null,7L,12L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("weighted graph 9", () -> { int a0=9; List<Exercise.Edge> a1=list(new Exercise.Edge(0,8,6L),new Exercise.Edge(1,0,3L),new Exercise.Edge(2,0,6L),new Exercise.Edge(2,1,1L),new Exercise.Edge(3,2,0L),new Exercise.Edge(3,6,1L),new Exercise.Edge(4,2,2L),new Exercise.Edge(4,5,6L),new Exercise.Edge(5,3,4L),new Exercise.Edge(5,4,7L),new Exercise.Edge(5,6,5L),new Exercise.Edge(5,8,2L),new Exercise.Edge(6,1,0L),new Exercise.Edge(6,3,7L),new Exercise.Edge(6,5,1L),new Exercise.Edge(6,7,3L),new Exercise.Edge(7,8,8L),new Exercise.Edge(8,2,1L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,8L,7L,(Long)null,(Long)null,(Long)null,(Long)null,(Long)null,6L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("weighted graph 10", () -> { int a0=10; List<Exercise.Edge> a1=list(new Exercise.Edge(0,0,8L),new Exercise.Edge(0,7,8L),new Exercise.Edge(0,9,2L),new Exercise.Edge(1,2,7L),new Exercise.Edge(2,2,6L),new Exercise.Edge(2,3,5L),new Exercise.Edge(2,8,7L),new Exercise.Edge(2,9,2L),new Exercise.Edge(3,0,4L),new Exercise.Edge(3,3,6L),new Exercise.Edge(4,5,5L),new Exercise.Edge(5,4,3L),new Exercise.Edge(5,9,8L),new Exercise.Edge(6,2,3L),new Exercise.Edge(6,6,5L),new Exercise.Edge(6,8,5L),new Exercise.Edge(6,9,0L),new Exercise.Edge(7,1,1L),new Exercise.Edge(7,2,3L),new Exercise.Edge(8,8,1L),new Exercise.Edge(8,9,1L),new Exercise.Edge(9,0,4L),new Exercise.Edge(9,4,3L),new Exercise.Edge(9,5,8L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,9L,11L,16L,5L,10L,(Long)null,8L,18L,2L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("weighted graph 11", () -> { int a0=11; List<Exercise.Edge> a1=list(new Exercise.Edge(0,8,4L),new Exercise.Edge(1,0,0L),new Exercise.Edge(1,1,1L),new Exercise.Edge(1,2,3L),new Exercise.Edge(1,3,2L),new Exercise.Edge(1,7,3L),new Exercise.Edge(1,8,5L),new Exercise.Edge(2,3,3L),new Exercise.Edge(3,4,5L),new Exercise.Edge(3,5,2L),new Exercise.Edge(3,8,3L),new Exercise.Edge(4,1,0L),new Exercise.Edge(4,2,8L),new Exercise.Edge(4,9,8L),new Exercise.Edge(5,3,3L),new Exercise.Edge(5,6,2L),new Exercise.Edge(6,0,2L),new Exercise.Edge(7,0,0L),new Exercise.Edge(7,9,2L),new Exercise.Edge(8,10,8L),new Exercise.Edge(9,7,6L),new Exercise.Edge(10,3,1L),new Exercise.Edge(10,7,0L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,18L,21L,13L,18L,15L,17L,12L,4L,14L,12L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("weighted graph 12", () -> { int a0=12; List<Exercise.Edge> a1=list(new Exercise.Edge(0,9,0L),new Exercise.Edge(0,10,0L),new Exercise.Edge(1,1,2L),new Exercise.Edge(1,5,8L),new Exercise.Edge(1,11,7L),new Exercise.Edge(3,0,7L),new Exercise.Edge(3,11,0L),new Exercise.Edge(4,1,6L),new Exercise.Edge(4,2,0L),new Exercise.Edge(4,9,6L),new Exercise.Edge(5,3,2L),new Exercise.Edge(5,8,4L),new Exercise.Edge(6,10,5L),new Exercise.Edge(7,7,5L),new Exercise.Edge(8,2,0L),new Exercise.Edge(8,5,5L),new Exercise.Edge(9,7,8L),new Exercise.Edge(9,9,6L),new Exercise.Edge(9,10,7L),new Exercise.Edge(10,1,6L),new Exercise.Edge(10,6,2L),new Exercise.Edge(10,7,4L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list(0L,6L,18L,16L,(Long)null,14L,2L,4L,18L,0L,0L,13L)); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("invalid input", () -> { int a0=2; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,-1L)); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2); }); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("invalid input", () -> { int a0=0; List<Exercise.Edge> a1=list(); int a2=0; String before=show(new Object[]{a0,a1,a2}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2); }); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { List<Exercise.Edge> a=new ArrayList<>();for(int i=0;i<1999;i++){a.add(new Exercise.Edge(i,i+1,1));a.add(new Exercise.Edge(0,i+1,10000));}var out=Exercise.solve(2000,a,0);eq(out.get(1999),1999L); });
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
