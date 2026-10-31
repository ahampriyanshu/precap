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
        test("greedy ratio counterexample", () -> { List<Exercise.Item> a0=list(new Exercise.Item(2,3L),new Exercise.Item(3,4L),new Exercise.Item(4,5L)); int a1=6; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),8L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("no item reuse", () -> { List<Exercise.Item> a0=list(new Exercise.Item(2,3L)); int a1=4; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("no items", () -> { List<Exercise.Item> a0=list(); int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("zero value", () -> { List<Exercise.Item> a0=list(new Exercise.Item(2,0L),new Exercise.Item(2,7L)); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),7L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("item selection 0", () -> { List<Exercise.Item> a0=list(); int a1=8; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("item selection 1", () -> { List<Exercise.Item> a0=list(new Exercise.Item(4,7L)); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("item selection 2", () -> { List<Exercise.Item> a0=list(new Exercise.Item(3,10L),new Exercise.Item(3,8L)); int a1=5; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),10L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("item selection 3", () -> { List<Exercise.Item> a0=list(new Exercise.Item(4,2L),new Exercise.Item(1,10L),new Exercise.Item(3,0L)); int a1=13; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),12L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("item selection 4", () -> { List<Exercise.Item> a0=list(new Exercise.Item(6,5L),new Exercise.Item(3,2L),new Exercise.Item(3,11L),new Exercise.Item(4,10L)); int a1=7; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),21L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("item selection 5", () -> { List<Exercise.Item> a0=list(new Exercise.Item(3,3L),new Exercise.Item(2,5L),new Exercise.Item(6,8L),new Exercise.Item(1,6L),new Exercise.Item(3,11L)); int a1=8; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),22L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("item selection 6", () -> { List<Exercise.Item> a0=list(new Exercise.Item(4,1L),new Exercise.Item(1,5L),new Exercise.Item(5,6L),new Exercise.Item(4,3L),new Exercise.Item(6,7L),new Exercise.Item(2,3L)); int a1=7; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),12L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("item selection 7", () -> { List<Exercise.Item> a0=list(new Exercise.Item(5,4L),new Exercise.Item(5,1L),new Exercise.Item(6,4L),new Exercise.Item(6,9L),new Exercise.Item(4,9L),new Exercise.Item(3,8L),new Exercise.Item(2,9L)); int a1=7; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),18L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("item selection 8", () -> { List<Exercise.Item> a0=list(new Exercise.Item(3,3L),new Exercise.Item(4,8L),new Exercise.Item(2,3L),new Exercise.Item(3,7L),new Exercise.Item(2,3L),new Exercise.Item(3,0L),new Exercise.Item(2,1L),new Exercise.Item(3,3L)); int a1=11; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),21L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("item selection 9", () -> { List<Exercise.Item> a0=list(new Exercise.Item(5,1L),new Exercise.Item(2,1L),new Exercise.Item(3,11L),new Exercise.Item(4,3L),new Exercise.Item(2,11L),new Exercise.Item(1,5L),new Exercise.Item(2,10L),new Exercise.Item(6,2L),new Exercise.Item(1,0L)); int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("item selection 10", () -> { List<Exercise.Item> a0=list(new Exercise.Item(3,2L),new Exercise.Item(5,7L),new Exercise.Item(5,5L),new Exercise.Item(6,5L),new Exercise.Item(4,7L),new Exercise.Item(6,1L),new Exercise.Item(5,0L),new Exercise.Item(3,7L),new Exercise.Item(6,9L),new Exercise.Item(3,7L)); int a1=9; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),16L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("item selection 11", () -> { List<Exercise.Item> a0=list(new Exercise.Item(2,2L),new Exercise.Item(3,1L),new Exercise.Item(1,7L),new Exercise.Item(5,11L),new Exercise.Item(1,4L),new Exercise.Item(3,4L),new Exercise.Item(4,8L),new Exercise.Item(2,3L),new Exercise.Item(3,1L),new Exercise.Item(1,0L),new Exercise.Item(5,1L)); int a1=11; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),30L); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("invalid input", () -> { List<Exercise.Item> a0=list(new Exercise.Item(0,2L)); int a1=3; String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("invalid input", () -> { List<Exercise.Item> a0=list(); int a1=-1; String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { List<Exercise.Item> items=new ArrayList<>();for(int i=0;i<100;i++)items.add(new Exercise.Item(1,1));eq(Exercise.solve(items,3000),100L); });
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
