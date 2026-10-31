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
            test("record fields overwrite scan and empty values", () -> {var s=new Exercise.RecordStore();s.set("r","z","1");s.set("r","a","");eq(s.get("r","a"),"");eq(s.scan("r",""),list(new Exercise.Field("a",""),new Exercise.Field("z","1")));s.scan("r","").clear();eq(s.scan("r","").size(),2);eq(s.get("missing","a"),null);});
        } else {
            test("TTL boundary and no older resurrection", () -> {var d=new Exercise.TemporalDatabase();d.set(2,"r","f","old",null);d.set(5,"r","f","new",3L);eq(d.get(7,"r","f"),"new");eq(d.get(8,"r","f"),null);eq(d.getAt(8,"r","f",4),"old");eq(d.getAt(8,"r","f",7),"new");eq(d.getAt(8,"r","f",8),null);});
            test("same timestamp latest tombstone and CAS lifetime", () -> {var d=new Exercise.TemporalDatabase();d.set(1,"r","f","a",2L);yes(!d.compareAndSet(1,"r","f","wrong","b",null));yes(d.compareAndSet(1,"r","f","a","b",null));eq(d.get(3,"r","f"),"b");yes(d.delete(3,"r","f"));eq(d.getAt(3,"r","f",3),null);d.set(3,"r","f","c",null);eq(d.getAt(3,"r","f",3),"c");});
            test("invalid TTL/lookback do not advance clock", () -> {var d=new Exercise.TemporalDatabase();d.set(2,"r","f","a",null);error(IllegalArgumentException.class,()->d.set(10,"r","f","x",0L));eq(d.get(3,"r","f"),"a");error(IllegalArgumentException.class,()->d.getAt(10,"r","f",11));eq(d.get(4,"r","f"),"a");error(IllegalArgumentException.class,()->d.get(3,"r","f"));});
            test("unsuccessful reads advance time and scans detach", () -> {var d=new Exercise.TemporalDatabase();yes(!d.delete(5,"r","x"));error(IllegalArgumentException.class,()->d.set(4,"r","f","x",null));d.set(5,"r","b","2",null);d.set(5,"r","a","1",null);eq(d.scan(5,"r",""),list(new Exercise.Field("a","1"),new Exercise.Field("b","2")));d.scan(5,"r","").clear();eq(d.scan(5,"r","").size(),2);eq(new Exercise.TemporalDatabase().get(0,"r","a"),null);});
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
