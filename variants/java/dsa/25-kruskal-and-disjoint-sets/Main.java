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
        test("cheap cycle leaves a vertex disconnected", () -> { int a0=4; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,1L),new Exercise.Edge(1,2,1L),new Exercise.Edge(0,2,1L),new Exercise.Edge(2,3,9L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Mst(11L,list(new Exercise.Edge(0,1,1L),new Exercise.Edge(0,2,1L),new Exercise.Edge(2,3,9L)))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("negative edge and self-loop", () -> { int a0=3; List<Exercise.Edge> a1=list(new Exercise.Edge(2,1,-2L),new Exercise.Edge(1,0,4L),new Exercise.Edge(0,0,-99L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Mst(2L,list(new Exercise.Edge(1,2,-2L),new Exercise.Edge(0,1,4L)))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("disconnected", () -> { int a0=3; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,1L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),null); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("empty graph", () -> { int a0=0; List<Exercise.Edge> a1=list(); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Mst(0L,list())); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated weighted graph 1", () -> { int a0=1; List<Exercise.Edge> a1=list(); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Mst(0L,list())); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated weighted graph 2", () -> { int a0=2; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,-3L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Mst(-3L,list(new Exercise.Edge(0,1,-3L)))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated weighted graph 3", () -> { int a0=3; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,5L),new Exercise.Edge(0,2,-2L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Mst(3L,list(new Exercise.Edge(0,2,-2L),new Exercise.Edge(0,1,5L)))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated weighted graph 4", () -> { int a0=4; List<Exercise.Edge> a1=list(new Exercise.Edge(1,2,4L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),null); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated weighted graph 5", () -> { int a0=5; List<Exercise.Edge> a1=list(new Exercise.Edge(1,2,2L),new Exercise.Edge(1,4,-1L),new Exercise.Edge(2,3,7L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),null); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated weighted graph 6", () -> { int a0=6; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,1L),new Exercise.Edge(0,2,3L),new Exercise.Edge(0,4,5L),new Exercise.Edge(2,3,2L),new Exercise.Edge(2,4,5L),new Exercise.Edge(3,4,0L),new Exercise.Edge(3,5,-2L),new Exercise.Edge(4,5,4L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Mst(4L,list(new Exercise.Edge(3,5,-2L),new Exercise.Edge(3,4,0L),new Exercise.Edge(0,1,1L),new Exercise.Edge(2,3,2L),new Exercise.Edge(0,2,3L)))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated weighted graph 7", () -> { int a0=7; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,0L),new Exercise.Edge(0,4,6L),new Exercise.Edge(1,3,3L),new Exercise.Edge(1,4,3L),new Exercise.Edge(1,5,6L),new Exercise.Edge(1,6,3L),new Exercise.Edge(2,3,5L),new Exercise.Edge(3,4,-2L),new Exercise.Edge(4,5,-1L),new Exercise.Edge(5,6,7L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Mst(8L,list(new Exercise.Edge(3,4,-2L),new Exercise.Edge(4,5,-1L),new Exercise.Edge(0,1,0L),new Exercise.Edge(1,3,3L),new Exercise.Edge(1,6,3L),new Exercise.Edge(2,3,5L)))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated weighted graph 8", () -> { int a0=8; List<Exercise.Edge> a1=list(new Exercise.Edge(0,2,7L),new Exercise.Edge(0,3,5L),new Exercise.Edge(0,4,2L),new Exercise.Edge(0,5,3L),new Exercise.Edge(1,2,4L),new Exercise.Edge(1,7,7L),new Exercise.Edge(2,4,4L),new Exercise.Edge(2,5,7L),new Exercise.Edge(3,4,2L),new Exercise.Edge(4,6,4L),new Exercise.Edge(5,6,2L),new Exercise.Edge(5,7,5L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Mst(22L,list(new Exercise.Edge(0,4,2L),new Exercise.Edge(3,4,2L),new Exercise.Edge(5,6,2L),new Exercise.Edge(0,5,3L),new Exercise.Edge(1,2,4L),new Exercise.Edge(2,4,4L),new Exercise.Edge(5,7,5L)))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated weighted graph 9", () -> { int a0=9; List<Exercise.Edge> a1=list(new Exercise.Edge(0,1,-2L),new Exercise.Edge(0,3,3L),new Exercise.Edge(0,4,4L),new Exercise.Edge(0,8,4L),new Exercise.Edge(1,4,1L),new Exercise.Edge(1,6,4L),new Exercise.Edge(1,8,2L),new Exercise.Edge(2,7,-1L),new Exercise.Edge(3,6,6L),new Exercise.Edge(3,8,2L),new Exercise.Edge(4,5,6L),new Exercise.Edge(4,8,0L),new Exercise.Edge(5,6,6L),new Exercise.Edge(5,7,6L),new Exercise.Edge(5,8,7L)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),new Exercise.Mst(16L,list(new Exercise.Edge(0,1,-2L),new Exercise.Edge(2,7,-1L),new Exercise.Edge(4,8,0L),new Exercise.Edge(1,4,1L),new Exercise.Edge(3,8,2L),new Exercise.Edge(1,6,4L),new Exercise.Edge(4,5,6L),new Exercise.Edge(5,7,6L)))); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("invalid input", () -> { int a0=2; List<Exercise.Edge> a1=list(new Exercise.Edge(0,2,4L)); String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { List<Exercise.Edge> a=new ArrayList<>();for(int i=1998;i>=0;i--)a.add(new Exercise.Edge(i+1,i,1));var out=Exercise.solve(2000,a);eq(out.totalCost(),1999L);eq(out.acceptedEdges().size(),1999);eq(out.acceptedEdges().get(0),new Exercise.Edge(0,1,1)); });
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
