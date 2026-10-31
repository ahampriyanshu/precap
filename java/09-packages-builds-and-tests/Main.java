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
            test("port boundaries and strict grammar", () -> {eq(Exercise.parsePort("1"),1);eq(Exercise.parsePort("65535"),65535);eq(Exercise.parsePort("0080"),80);for(String s:list("0","65536","+80"," 80","1.0","","99999999999"))error(IllegalArgumentException.class,()->Exercise.parsePort(s));});
        } else {
            test("defaults order flags and array ownership", () -> {eq(Exercise.parseOptions(new String[]{}),new Exercise.Options(8080,false));String[] a={"--verbose","--port","443"};eq(Exercise.parseOptions(a),new Exercise.Options(443,true));eq(a,new String[]{"--verbose","--port","443"});eq(Exercise.parseOptions(new String[]{"--port","80","--verbose"}),new Exercise.Options(80,true));});
            test("duplicates missing values unknown flags and no global state", () -> {for(String[] a:new String[][]{{"--port"},{"--port","80","--port","90"},{"--verbose","--verbose"},{"--bad"},{"--port","0"}})error(IllegalArgumentException.class,()->Exercise.parseOptions(a));eq(Exercise.parseOptions(new String[]{}),new Exercise.Options(8080,false));});
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
