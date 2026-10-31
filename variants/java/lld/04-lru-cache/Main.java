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
            test("touch existing new empty and ownership", () -> {var keys=list("a","b");eq(Exercise.touchOrder(keys,"a"),list("b","a"));eq(Exercise.touchOrder(keys,"c"),list("a","b","c"));eq(Exercise.touchOrder(list(),"x"),list("x"));eq(keys,list("a","b"));});
        } else {
            test("access update and eviction", () -> {var c=new Exercise.LRUCache(2);c.put("a",1);c.put("b",2);eq(c.get("a",null),1L);c.put("c",3);eq(c.items(),list(new Exercise.Entry("a",1),new Exercise.Entry("c",3)));c.put("a",9);eq(c.items(),list(new Exercise.Entry("c",3),new Exercise.Entry("a",9)));});
            test("miss fallback identity and delete", () -> {var c=new Exercise.LRUCache(1);Object marker=new Object();yes(c.get("missing",marker)==marker);c.put("a",-1);yes(c.delete("a"));yes(!c.delete("a"));eq(c.items(),list());});
            test("zero validation and snapshots", () -> {error(IllegalArgumentException.class,()->new Exercise.LRUCache(-1));var c=new Exercise.LRUCache(0);c.put("x",1);eq(c.items(),list());error(IllegalArgumentException.class,()->c.put("",1));var d=new Exercise.LRUCache(1);d.put("x",1);d.items().clear();eq(d.items().size(),1);});
            test("bounded recency cycles", () -> {var c=new Exercise.LRUCache(3);for(int i=0;i<80;i++)c.put("k"+(i%5),i);eq(c.items(),list(new Exercise.Entry("k2",77),new Exercise.Entry("k3",78),new Exercise.Entry("k4",79)));});
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
