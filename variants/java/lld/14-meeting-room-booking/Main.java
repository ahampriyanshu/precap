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
            test("half-open overlap and invalid boundaries", () -> {var c=new Exercise.RoomCalendar();yes(c.reserve(2,4));yes(c.reserve(0,2));yes(!c.reserve(1,3));error(IllegalArgumentException.class,()->c.reserve(4,4));eq(c.slots(),list(new Exercise.Interval(0,2),new Exercise.Interval(2,4)));c.slots().clear();eq(c.slots().size(),2);});
        } else {
            test("capacity deterministic multiroom and atomic failures", () -> {var b=new Exercise.MeetingRoomBooking(map("z",4,"b",2,"a",2));eq(b.book("x",0,2,2,2),list("a","b"));eq(b.book("fail",0,2,2,2),null);eq(b.schedule("z"),list());eq(b.book("fail",2,4,2,2),list("a","b"));eq(b.book("large",0,2,5,1),null);});
            test("cancel releases all and IDs remain reserved", () -> {var b=new Exercise.MeetingRoomBooking(map("a",2,"b",2));b.book("x",0,3,1,2);yes(b.cancel("x"));yes(!b.cancel("x"));eq(b.allocation("x"),null);eq(b.book("x",4,5,1,1),null);eq(b.book("y",0,3,1,2),list("a","b"));eq(b.schedule("a"),list(new Exercise.Reservation("y",0,3,1)));});
            test("validation precedence snapshots input and instances", () -> {var rooms=Main.<String,Integer>map("a",2);var b=new Exercise.MeetingRoomBooking(rooms);rooms.clear();b.book("x",0,1,1,1);error(IllegalArgumentException.class,()->b.book("x",-1,2,1,1));error(IllegalArgumentException.class,()->b.schedule("unknown"));b.allocation("x").clear();b.schedule("a").clear();eq(b.allocation("x"),list("a"));eq(new Exercise.MeetingRoomBooking(map()).book("x",0,1,1,1),null);});
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
