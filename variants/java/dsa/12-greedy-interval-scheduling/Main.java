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
        test("earliest-start trap", () -> { List<Exercise.Job> a0=list(new Exercise.Job("long",0L,10L),new Exercise.Job("a",1L,2L),new Exercise.Job("b",2L,3L),new Exercise.Job("c",3L,4L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("a","b","c")); } finally { eq(show(new Object[]{a0}),before); } });
        test("tie and touching", () -> { List<Exercise.Job> a0=list(new Exercise.Job("b",0L,2L),new Exercise.Job("a",0L,2L),new Exercise.Job("c",2L,3L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("a","c")); } finally { eq(show(new Object[]{a0}),before); } });
        test("empty schedule", () -> { List<Exercise.Job> a0=list(); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list()); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated schedule 1", () -> { List<Exercise.Job> a0=list(new Exercise.Job("j0",4L,8L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("j0")); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated schedule 2", () -> { List<Exercise.Job> a0=list(new Exercise.Job("j0",8L,13L),new Exercise.Job("j1",2L,5L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("j1","j0")); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated schedule 3", () -> { List<Exercise.Job> a0=list(new Exercise.Job("j0",5L,9L),new Exercise.Job("j1",7L,9L),new Exercise.Job("j2",6L,11L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("j0")); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated schedule 4", () -> { List<Exercise.Job> a0=list(new Exercise.Job("j0",-2L,-1L),new Exercise.Job("j1",5L,7L),new Exercise.Job("j2",-3L,0L),new Exercise.Job("j3",2L,6L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("j0","j3")); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated schedule 5", () -> { List<Exercise.Job> a0=list(new Exercise.Job("j0",1L,5L),new Exercise.Job("j1",0L,2L),new Exercise.Job("j2",-2L,-1L),new Exercise.Job("j3",4L,6L),new Exercise.Job("j4",4L,9L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("j2","j1","j3")); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated schedule 6", () -> { List<Exercise.Job> a0=list(new Exercise.Job("j0",0L,4L),new Exercise.Job("j1",1L,2L),new Exercise.Job("j2",2L,4L),new Exercise.Job("j3",0L,3L),new Exercise.Job("j4",-1L,3L),new Exercise.Job("j5",0L,4L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("j1","j2")); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated schedule 7", () -> { List<Exercise.Job> a0=list(new Exercise.Job("j0",2L,6L),new Exercise.Job("j1",-2L,1L),new Exercise.Job("j2",6L,8L),new Exercise.Job("j3",-1L,1L),new Exercise.Job("j4",-4L,1L),new Exercise.Job("j5",9L,12L),new Exercise.Job("j6",6L,8L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("j4","j0","j2","j5")); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated schedule 8", () -> { List<Exercise.Job> a0=list(new Exercise.Job("j0",8L,9L),new Exercise.Job("j1",-1L,2L),new Exercise.Job("j2",3L,4L),new Exercise.Job("j3",6L,9L),new Exercise.Job("j4",4L,7L),new Exercise.Job("j5",3L,4L),new Exercise.Job("j6",0L,3L),new Exercise.Job("j7",9L,12L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("j1","j2","j4","j0","j7")); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated schedule 9", () -> { List<Exercise.Job> a0=list(new Exercise.Job("j0",-4L,-1L),new Exercise.Job("j1",8L,12L),new Exercise.Job("j2",6L,8L),new Exercise.Job("j3",0L,5L),new Exercise.Job("j4",1L,4L),new Exercise.Job("j5",9L,11L),new Exercise.Job("j6",2L,3L),new Exercise.Job("j7",-4L,-1L),new Exercise.Job("j8",6L,11L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("j0","j6","j2","j5")); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated schedule 10", () -> { List<Exercise.Job> a0=list(new Exercise.Job("j0",8L,11L),new Exercise.Job("j1",-3L,1L),new Exercise.Job("j2",-1L,4L),new Exercise.Job("j3",7L,10L),new Exercise.Job("j4",6L,11L),new Exercise.Job("j5",0L,5L),new Exercise.Job("j6",0L,3L),new Exercise.Job("j7",-2L,3L),new Exercise.Job("j8",1L,3L),new Exercise.Job("j9",9L,13L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("j1","j8","j3")); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated schedule 11", () -> { List<Exercise.Job> a0=list(new Exercise.Job("j0",0L,1L),new Exercise.Job("j1",2L,5L),new Exercise.Job("j2",-3L,-2L),new Exercise.Job("j3",-3L,-2L),new Exercise.Job("j4",9L,10L),new Exercise.Job("j5",-4L,-1L),new Exercise.Job("j6",-4L,0L),new Exercise.Job("j7",3L,8L),new Exercise.Job("j8",-3L,0L),new Exercise.Job("j9",9L,14L),new Exercise.Job("j10",-1L,0L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("j2","j10","j0","j1","j4")); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated schedule 12", () -> { List<Exercise.Job> a0=list(new Exercise.Job("j0",2L,6L),new Exercise.Job("j1",-4L,-1L),new Exercise.Job("j2",-1L,3L),new Exercise.Job("j3",-2L,0L),new Exercise.Job("j4",2L,7L),new Exercise.Job("j5",4L,7L),new Exercise.Job("j6",4L,7L),new Exercise.Job("j7",-3L,2L),new Exercise.Job("j8",-2L,3L),new Exercise.Job("j9",5L,8L),new Exercise.Job("j10",6L,11L),new Exercise.Job("j11",8L,11L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("j1","j2","j5","j11")); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated schedule 13", () -> { List<Exercise.Job> a0=list(new Exercise.Job("j0",2L,4L),new Exercise.Job("j1",1L,4L),new Exercise.Job("j2",6L,10L),new Exercise.Job("j3",-2L,2L),new Exercise.Job("j4",8L,10L),new Exercise.Job("j5",2L,5L),new Exercise.Job("j6",6L,9L),new Exercise.Job("j7",3L,7L),new Exercise.Job("j8",5L,7L),new Exercise.Job("j9",4L,8L),new Exercise.Job("j10",6L,10L),new Exercise.Job("j11",1L,3L),new Exercise.Job("j12",0L,3L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("j3","j0","j8","j4")); } finally { eq(show(new Object[]{a0}),before); } });
        test("generated schedule 14", () -> { List<Exercise.Job> a0=list(new Exercise.Job("j0",6L,7L),new Exercise.Job("j1",0L,5L),new Exercise.Job("j2",9L,14L),new Exercise.Job("j3",1L,2L),new Exercise.Job("j4",8L,9L),new Exercise.Job("j5",7L,11L),new Exercise.Job("j6",3L,8L),new Exercise.Job("j7",7L,8L),new Exercise.Job("j8",-4L,1L),new Exercise.Job("j9",5L,9L),new Exercise.Job("j10",9L,10L),new Exercise.Job("j11",-3L,0L),new Exercise.Job("j12",0L,1L),new Exercise.Job("j13",0L,3L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list("j11","j12","j3","j0","j7","j4","j10")); } finally { eq(show(new Object[]{a0}),before); } });
        test("invalid input", () -> { List<Exercise.Job> a0=list(new Exercise.Job("x",2L,2L)); String before=show(new Object[]{a0}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0) : Exercise.solve(a0); }); } finally { eq(show(new Object[]{a0}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { List<Exercise.Job> a=new ArrayList<>();for(int i=4999;i>=0;i--)a.add(new Exercise.Job("j"+i,2*i,2*i+1));var out=Exercise.solve(a);eq(out.size(),5000);eq(out.get(0),"j0");eq(out.get(4999),"j4999"); });
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
