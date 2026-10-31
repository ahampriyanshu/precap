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
        test("nested", () -> { List<String> a0=list("LOAD:a","LOAD:b","UNLOAD:b","UNLOAD:a"); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),true); } finally { eq(show(new Object[]{a0}),before); } });
        test("counts are insufficient", () -> { List<String> a0=list("LOAD:a","LOAD:b","UNLOAD:a","UNLOAD:b"); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),false); } finally { eq(show(new Object[]{a0}),before); } });
        test("empty balanced", () -> { List<String> a0=list(); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),true); } finally { eq(show(new Object[]{a0}),before); } });
        test("underflow", () -> { List<String> a0=list("UNLOAD:x"); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),false); } finally { eq(show(new Object[]{a0}),before); } });
        test("unfinished", () -> { List<String> a0=list("LOAD:x"); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),false); } finally { eq(show(new Object[]{a0}),before); } });
        test("invalid input", () -> { List<String> a0=list("LOAD:"); String before=show(new Object[]{a0}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0) : Exercise.solve(a0); }); } finally { eq(show(new Object[]{a0}),before); } });
        test("invalid input", () -> { List<String> a0=list("PUSH:x"); String before=show(new Object[]{a0}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0) : Exercise.solve(a0); }); } finally { eq(show(new Object[]{a0}),before); } });
        test("invalid input", () -> { List<String> a0=list("LOAD:a:b"); String before=show(new Object[]{a0}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0) : Exercise.solve(a0); }); } finally { eq(show(new Object[]{a0}),before); } });
        test("ordering failure precedes later parsing", () -> eq(prototype?Exercise.prototype(list("UNLOAD:x","bad")):Exercise.solve(list("UNLOAD:x","bad")),false));
        if(!prototype) test("final scale and structure boundary", () -> { List<String> a=new ArrayList<>();for(int i=0;i<10000;i++)a.add("LOAD:"+i);for(int i=9999;i>=0;i--)a.add("UNLOAD:"+i);eq(Exercise.solve(a),true); });
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
