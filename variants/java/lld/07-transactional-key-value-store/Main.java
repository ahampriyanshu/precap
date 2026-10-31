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
            test("CRUD empty values and independence", () -> {var s=new Exercise.KeyValueStore();s.set("","");eq(s.get(""),"");s.set("","new");yes(s.delete(""));yes(!s.delete(""));eq(s.get(""),null);eq(new Exercise.KeyValueStore().get(""),null);});
        } else {
            test("inner commit remains inside outer rollback", () -> {var s=new Exercise.TransactionalStore();s.set("k","base");eq(s.begin(),1);s.set("k","outer");eq(s.begin(),2);s.set("k","inner");eq(s.commit(),1);eq(s.get("k"),"inner");eq(s.rollback(),0);eq(s.get("k"),"base");});
            test("deletion inner rollback commit and recreation", () -> {var s=new Exercise.TransactionalStore();s.set("a","");s.begin();yes(s.delete("a"));eq(s.get("a"),null);s.begin();s.set("a","child");s.rollback();eq(s.get("a"),null);s.commit();eq(s.get("a"),null);s.set("a","new");eq(s.get("a"),"new");});
            test("prefix ordering snapshot and depth errors", () -> {var s=new Exercise.TransactionalStore();s.set("z","1");s.set("a","2");s.set("ab","3");eq(new ArrayList<>(s.snapshot("a").keySet()),list("a","ab"));s.snapshot("").clear();eq(s.snapshot("").size(),3);error(IllegalStateException.class,()->s.commit());error(IllegalStateException.class,()->s.rollback());eq(s.depth(),0);eq(new Exercise.TransactionalStore().snapshot(""),map());});
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
