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
            test("change and exact payment", () -> {eq(Exercise.changeDue(100,150),50L);eq(Exercise.changeDue(0,0),0L);});
            test("invalid or insufficient payment", () -> {error(IllegalArgumentException.class,()->Exercise.changeDue(5,4));error(IllegalArgumentException.class,()->Exercise.changeDue(-1,1));});
        } else {
            test("sale stock and change", () -> {var m=new Exercise.VendingMachine(list(new Exercise.Product("x",100,1)));eq(m.insert(150),150L);eq(m.select("x"),new Exercise.Receipt("x",50));eq(m.balance(),0L);eq(m.inventory().get("x").stock(),0L);});
            test("failed selection retains credit", () -> {var m=new Exercise.VendingMachine(list(new Exercise.Product("x",100,1)));m.insert(50);error(IllegalArgumentException.class,()->m.select("x"));error(NoSuchElementException.class,()->m.select("missing"));eq(m.balance(),50L);eq(m.inventory().get("x").stock(),1L);eq(m.refund(),50L);eq(m.refund(),0L);});
            test("catalog validation and snapshot isolation", () -> {error(IllegalArgumentException.class,()->new Exercise.VendingMachine(list(new Exercise.Product("x",0,1))));error(IllegalArgumentException.class,()->new Exercise.VendingMachine(list(new Exercise.Product("x",1,1),new Exercise.Product("x",1,2))));var p=list(new Exercise.Product("x",1,2));var m=new Exercise.VendingMachine(p);p.clear();m.inventory().clear();eq(m.inventory().size(),1);error(IllegalArgumentException.class,()->m.insert(0));eq(m.balance(),0L);});
            test("money conservation across sessions", () -> {var m=new Exercise.VendingMachine(list(new Exercise.Product("x",3,20)));long inserted=0,returned=0;for(int i=0;i<20;i++){inserted+=5;m.insert(5);returned+=m.select("x").change();}eq(inserted-returned,60L);eq(m.inventory().get("x").stock(),0L);eq(new Exercise.VendingMachine(list()).balance(),0L);});
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
