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
            test("ASCII tokens case digits duplicates and separators", () -> {eq(Exercise.tokenize("A-a 22 café 中文"),list("a","a","22","caf"));eq(Exercise.tokenize("!!!"),list());var tokens=Exercise.tokenize("x");tokens.clear();eq(Exercise.tokenize("x"),list("x"));});
        } else {
            test("term ranking phrase overlap and exact text", () -> {var s=new Exercise.SearchEngine();s.add("b","A a a");s.add("a","a a");s.add("empty","");eq(s.search("A",10),list(new Exercise.Hit("b",3),new Exercise.Hit("a",2)));eq(s.searchPhrase("a a",10),list(new Exercise.Hit("b",2),new Exercise.Hit("a",1)));eq(s.get("b"),"A a a");eq(s.stats(),new Exercise.Stats(3,5));});
            test("update delete reuse and duplicate safety", () -> {var s=new Exercise.SearchEngine();yes(s.add("x","old old"));yes(!s.add("x","new"));yes(s.update("x","new"));eq(s.search("old",10),list());eq(s.search("new",10),list(new Exercise.Hit("x",1)));yes(s.delete("x"));yes(!s.delete("x"));s.add("x","reuse");eq(s.search("new",10),list());eq(s.stats(),new Exercise.Stats(1,1));});
            test("query validation limits and ownership", () -> {var s=new Exercise.SearchEngine();s.add("x","a");error(IllegalArgumentException.class,()->s.search("a b",0));error(IllegalArgumentException.class,()->s.search("a",-1));eq(s.searchPhrase("!!!",10),list());s.search("a",1).clear();eq(s.search("a",0),list());eq(s.stats(),new Exercise.Stats(1,1));eq(new Exercise.SearchEngine().stats(),new Exercise.Stats(0,0));});
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
