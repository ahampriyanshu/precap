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
        if(prototype) {
            test("buffer copy identity mutation and empty", () -> {byte[] a={1,2};byte[] b=Exercise.copyBuffer(a);yes(a!=b);eq(b,a);b[0]=9;eq(a,new byte[]{1,2});eq(Exercise.copyBuffer(new byte[]{}),new byte[]{});});
        } else {
            test("weighted eviction access recency and accounting", () -> {var c=new Exercise.ByteCache(5);yes(c.put("a",new byte[]{1,2}));yes(c.put("b",new byte[]{3,4}));eq(c.usage(),4L);c.get("a");yes(c.put("c",new byte[]{5,6}));eq(c.get("b"),null);eq(c.get("a"),new byte[]{1,2});eq(c.usage(),4L);yes(c.put("a",new byte[]{7}));eq(c.usage(),3L);yes(c.remove("a"));yes(!c.remove("a"));eq(c.usage(),2L);c.clear();eq(c.usage(),0L);});
            test("retained inputs and outputs are defensive", () -> {var c=new Exercise.ByteCache(4);byte[] a={1,2};c.put("x",a);a[0]=9;byte[] b=c.get("x");eq(b,new byte[]{1,2});b[0]=8;eq(c.get("x"),new byte[]{1,2});yes(!c.put("x",new byte[5]));eq(c.get("x"),new byte[]{1,2});eq(c.usage(),2L);});
            test("validation zero budget and independent caches", () -> {error(IllegalArgumentException.class,()->new Exercise.ByteCache(-1));var c=new Exercise.ByteCache(0);yes(c.put("e",new byte[]{}));eq(c.get("e"),new byte[]{});yes(!c.put("x",new byte[]{1}));error(IllegalArgumentException.class,()->c.put("",new byte[]{}));eq(c.usage(),0L);eq(new Exercise.ByteCache(1).get("e"),null);});
        }
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
