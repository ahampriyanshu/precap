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
            test("available filter order and case", () -> {var copies=list(new Exercise.CopyState("b","T",true),new Exercise.CopyState("a","T",true),new Exercise.CopyState("c","T",false));eq(Exercise.availableCopies(copies,"T"),list("a","b"));eq(Exercise.availableCopies(copies,"t"),list());eq(copies.size(),3);});
        } else {
            test("copy allocation and owner lifecycle", () -> {var lib=new Exercise.Library(list(new Exercise.BookCopy("b","T"),new Exercise.BookCopy("a","T")));eq(lib.borrow("u","T"),"a");error(IllegalArgumentException.class,()->lib.borrow("u","T"));eq(lib.borrow("v","T"),"b");eq(lib.borrow("w","T"),null);error(IllegalArgumentException.class,()->lib.returnCopy("a","v"));yes(lib.returnCopy("a","u"));yes(!lib.returnCopy("a","u"));eq(lib.borrow("u","T"),"a");});
            test("snapshots input and instance ownership", () -> {var copies=list(new Exercise.BookCopy("a","T"));var l=new Exercise.Library(copies);copies.clear();l.available("T").clear();eq(l.available("T"),list("a"));l.borrow("u","T");l.loans().clear();eq(l.loans(),list(new Exercise.Loan("a","T","u")));eq(new Exercise.Library(list()).loans(),list());});
            test("validation is atomic", () -> {error(IllegalArgumentException.class,()->new Exercise.Library(list(new Exercise.BookCopy("a","T"),new Exercise.BookCopy("a","X"))));var l=new Exercise.Library(list(new Exercise.BookCopy("a","T")));error(IllegalArgumentException.class,()->l.borrow("","T"));eq(l.available("T"),list("a"));});
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
