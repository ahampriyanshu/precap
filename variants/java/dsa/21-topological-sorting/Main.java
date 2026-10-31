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
        test("multiple legal choices", () -> { int a0=4; List<Exercise.Link> a1=list(new Exercise.Link(0,2),new Exercise.Link(1,2),new Exercise.Link(2,3)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1,2,3)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("cycle", () -> { int a0=2; List<Exercise.Link> a1=list(new Exercise.Link(0,1),new Exercise.Link(1,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),null); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("duplicate prerequisite", () -> { int a0=2; List<Exercise.Link> a1=list(new Exercise.Link(0,1),new Exercise.Link(0,1)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("self cycle", () -> { int a0=1; List<Exercise.Link> a1=list(new Exercise.Link(0,0)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),null); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("empty graph", () -> { int a0=0; List<Exercise.Link> a1=list(); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated DAG 1", () -> { int a0=1; List<Exercise.Link> a1=list(); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated DAG 2", () -> { int a0=2; List<Exercise.Link> a1=list(new Exercise.Link(0,1)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated DAG 3", () -> { int a0=3; List<Exercise.Link> a1=list(); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1,2)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated DAG 4", () -> { int a0=4; List<Exercise.Link> a1=list(new Exercise.Link(0,2),new Exercise.Link(2,3)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1,2,3)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated DAG 5", () -> { int a0=5; List<Exercise.Link> a1=list(new Exercise.Link(0,2),new Exercise.Link(1,2),new Exercise.Link(1,4)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1,2,3,4)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated DAG 6", () -> { int a0=6; List<Exercise.Link> a1=list(new Exercise.Link(0,4),new Exercise.Link(1,2),new Exercise.Link(2,3),new Exercise.Link(2,4),new Exercise.Link(3,4),new Exercise.Link(3,5),new Exercise.Link(4,5)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1,2,3,4,5)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated DAG 7", () -> { int a0=7; List<Exercise.Link> a1=list(new Exercise.Link(0,2),new Exercise.Link(0,6),new Exercise.Link(1,2),new Exercise.Link(1,6),new Exercise.Link(2,5),new Exercise.Link(3,5),new Exercise.Link(5,6)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1,2,3,4,5,6)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated DAG 8", () -> { int a0=8; List<Exercise.Link> a1=list(new Exercise.Link(0,1),new Exercise.Link(0,2),new Exercise.Link(0,3),new Exercise.Link(2,3),new Exercise.Link(2,4),new Exercise.Link(3,7),new Exercise.Link(4,6)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1,2,3,4,5,6,7)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated DAG 9", () -> { int a0=9; List<Exercise.Link> a1=list(new Exercise.Link(0,7),new Exercise.Link(0,8),new Exercise.Link(1,4),new Exercise.Link(1,5),new Exercise.Link(1,8),new Exercise.Link(2,4),new Exercise.Link(2,5),new Exercise.Link(2,7),new Exercise.Link(2,8),new Exercise.Link(4,5),new Exercise.Link(4,8),new Exercise.Link(5,6)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1,2,3,4,5,6,7,8)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated DAG 10", () -> { int a0=10; List<Exercise.Link> a1=list(new Exercise.Link(0,2),new Exercise.Link(0,3),new Exercise.Link(0,4),new Exercise.Link(0,7),new Exercise.Link(0,9),new Exercise.Link(1,2),new Exercise.Link(1,4),new Exercise.Link(1,6),new Exercise.Link(1,7),new Exercise.Link(1,9),new Exercise.Link(2,6),new Exercise.Link(3,6),new Exercise.Link(4,7),new Exercise.Link(4,9),new Exercise.Link(5,8)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1,2,3,4,5,6,7,8,9)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated DAG 11", () -> { int a0=11; List<Exercise.Link> a1=list(new Exercise.Link(0,5),new Exercise.Link(0,7),new Exercise.Link(0,9),new Exercise.Link(0,10),new Exercise.Link(1,4),new Exercise.Link(1,6),new Exercise.Link(1,9),new Exercise.Link(2,3),new Exercise.Link(2,7),new Exercise.Link(2,8),new Exercise.Link(2,9),new Exercise.Link(3,4),new Exercise.Link(3,9),new Exercise.Link(4,5),new Exercise.Link(4,8),new Exercise.Link(4,10),new Exercise.Link(5,7),new Exercise.Link(5,8),new Exercise.Link(5,9),new Exercise.Link(6,8),new Exercise.Link(8,9),new Exercise.Link(9,10)); String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1,2,3,4,5,6,7,8,9,10)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("invalid input", () -> { int a0=-1; List<Exercise.Link> a1=list(); String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("invalid input", () -> { int a0=2; List<Exercise.Link> a1=list(new Exercise.Link(2,0)); String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { List<Exercise.Link> a=new ArrayList<>();for(int i=0;i<9999;i++){a.add(new Exercise.Link(i,i+1));a.add(new Exercise.Link(i,i+1));}var out=Exercise.solve(10000,a);eq(out.size(),10000);eq(out.get(0),0);eq(out.get(9999),9999); });
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
