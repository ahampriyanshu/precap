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
            test("catalog duplicates zero bytes and invalid data", () -> {var c=new Exercise.FileCatalog();yes(c.upload("x",0));yes(!c.upload("x",9));eq(c.get("x"),0L);error(IllegalArgumentException.class,()->c.upload("",1));error(IllegalArgumentException.class,()->c.upload("y",-1));eq(c.get("y"),null);});
        } else {
            test("quota failure atomicity and exact expiry", () -> {var f=new Exercise.FileStorage(10);yes(f.upload("x",6,5L));yes(!f.upload("y",5,null));eq(f.usage(),6L);f.advanceTo(4);yes(f.get("x")!=null);f.advanceTo(5);eq(f.get("x"),null);eq(f.usage(),0L);yes(f.upload("x",10,null));yes(f.delete("x"));yes(!f.delete("x"));eq(f.usage(),0L);});
            test("copy preserves absolute expiration and charges independently", () -> {var f=new Exercise.FileStorage(20);f.upload("a",5,5L);f.advanceTo(2);yes(f.copy("a","b"));eq(f.get("b"),new Exercise.StoredFile("b",5,5L));eq(f.usage(),10L);yes(!f.copy("a","a"));f.delete("a");eq(f.usage(),5L);f.advanceTo(5);eq(f.usage(),0L);eq(f.get("b"),null);});
            test("search order snapshots validation and clock atomicity", () -> {var f=new Exercise.FileStorage(10);f.upload("b",2,null);f.upload("a",2,null);f.upload("A",1,null);eq(f.search("",9),list(new Exercise.StoredFile("a",2,null),new Exercise.StoredFile("b",2,null),new Exercise.StoredFile("A",1,null)));f.search("",9).clear();eq(f.search("",9).size(),3);error(IllegalArgumentException.class,()->f.upload("a",-1,0L));f.advanceTo(1);error(IllegalArgumentException.class,()->f.advanceTo(0));eq(f.usage(),5L);eq(new Exercise.FileStorage(0).usage(),0L);});
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
