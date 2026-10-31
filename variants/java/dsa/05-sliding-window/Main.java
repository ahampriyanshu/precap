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
        test("duplicate removal", () -> { List<String> a0=list("food","food","water","fuel","water"); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("empty", () -> { List<String> a0=list(); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("no kinds allowed", () -> { List<String> a0=list("a"); int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=1 k=0", () -> { List<String> a0=list("b"); int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=1 k=1", () -> { List<String> a0=list("c"); int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=1 k=2", () -> { List<String> a0=list("b"); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=1 k=3", () -> { List<String> a0=list("c"); int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=2 k=0", () -> { List<String> a0=list("a","a"); int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=2 k=1", () -> { List<String> a0=list("a","b"); int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=2 k=2", () -> { List<String> a0=list("a","a"); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),2); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=2 k=3", () -> { List<String> a0=list("a","b"); int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),2); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=3 k=0", () -> { List<String> a0=list("b","a","a"); int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=3 k=1", () -> { List<String> a0=list("a","c","a"); int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=3 k=2", () -> { List<String> a0=list("c","c","c"); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=3 k=3", () -> { List<String> a0=list("c","a","c"); int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=4 k=0", () -> { List<String> a0=list("b","c","a","a"); int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=4 k=1", () -> { List<String> a0=list("b","c","c","a"); int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),2); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=4 k=2", () -> { List<String> a0=list("a","c","c","b"); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=4 k=3", () -> { List<String> a0=list("c","b","c","c"); int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),4); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=5 k=0", () -> { List<String> a0=list("c","a","c","c","c"); int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=5 k=1", () -> { List<String> a0=list("b","a","b","a","a"); int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),2); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=5 k=2", () -> { List<String> a0=list("a","a","b","b","c"); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),4); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=5 k=3", () -> { List<String> a0=list("a","b","b","a","a"); int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),5); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=6 k=0", () -> { List<String> a0=list("b","a","b","b","c","a"); int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=6 k=1", () -> { List<String> a0=list("c","a","c","a","a","a"); int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=6 k=2", () -> { List<String> a0=list("a","a","b","a","b","b"); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),6); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=6 k=3", () -> { List<String> a0=list("b","a","b","b","b","a"); int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),6); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=7 k=0", () -> { List<String> a0=list("a","c","a","b","b","a","a"); int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=7 k=1", () -> { List<String> a0=list("b","b","b","b","c","c","c"); int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),4); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=7 k=2", () -> { List<String> a0=list("b","b","a","a","c","b","c"); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),4); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=7 k=3", () -> { List<String> a0=list("b","a","a","c","b","c","c"); int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),7); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=8 k=0", () -> { List<String> a0=list("a","c","c","a","c","a","a","c"); int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=8 k=1", () -> { List<String> a0=list("b","a","c","b","c","b","a","c"); int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=8 k=2", () -> { List<String> a0=list("c","a","a","c","a","b","a","c"); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),5); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=8 k=3", () -> { List<String> a0=list("b","a","c","c","c","a","a","b"); int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),8); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=9 k=0", () -> { List<String> a0=list("b","c","b","c","a","c","a","b","b"); int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=9 k=1", () -> { List<String> a0=list("a","b","c","a","a","b","a","b","b"); int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),2); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=9 k=2", () -> { List<String> a0=list("a","b","b","b","c","c","a","c","b"); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),5); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=9 k=3", () -> { List<String> a0=list("c","a","b","a","b","b","c","b","c"); int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),9); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=10 k=0", () -> { List<String> a0=list("b","c","b","a","c","a","b","a","a","c"); int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=10 k=1", () -> { List<String> a0=list("a","b","a","b","c","c","c","a","b","c"); int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=10 k=2", () -> { List<String> a0=list("a","b","c","c","c","b","a","c","c","b"); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),5); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=10 k=3", () -> { List<String> a0=list("a","a","b","a","c","c","c","c","c","b"); int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),10); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=11 k=0", () -> { List<String> a0=list("b","a","c","c","c","c","c","c","a","c","a"); int a1=0; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),0); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=11 k=1", () -> { List<String> a0=list("a","b","b","b","a","a","b","b","b","c","c"); int a1=1; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=11 k=2", () -> { List<String> a0=list("c","b","c","c","a","b","c","b","b","a","b"); int a1=2; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),4); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("window n=11 k=3", () -> { List<String> a0=list("a","a","b","c","a","c","c","c","c","c","b"); int a1=3; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),11); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("negative limit", () -> { List<String> a0=list("a"); int a1=-1; String before=show(new Object[]{a0,a1}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1); }); } finally { eq(show(new Object[]{a0,a1}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { eq(Exercise.solve(new ArrayList<>(Collections.nCopies(100000,"x")),1),100000);List<String> a=new ArrayList<>();for(int i=0;i<20000;i++)a.add(i%2==0?"a":"b");eq(Exercise.solve(a,1),1); });
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
