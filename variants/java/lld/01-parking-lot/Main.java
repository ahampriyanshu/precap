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
            test("prototype allocation policy", () -> eq(Exercise.chooseSpot(list(new Exercise.Spot("v","van"),new Exercise.Spot("c","car")),"car"),"c"));
            test("prototype empty and compatibility", () -> {eq(Exercise.chooseSpot(list(),"van"),null);eq(Exercise.chooseSpot(list(new Exercise.Spot("c","car")),"van"),null);});
            test("prototype validates entire inventory", () -> {error(IllegalArgumentException.class,()->Exercise.chooseSpot(list(new Exercise.Spot("a","car"),new Exercise.Spot("a","van")),"car"));error(IllegalArgumentException.class,()->Exercise.chooseSpot(list(new Exercise.Spot("a","bad")),"car"));});
        } else {
            test("ticket lifecycle and successful IDs", () -> {var lot=new Exercise.ParkingLot(list(new Exercise.Spot("c","car")));var t=lot.park("a","car");eq(t,new Exercise.Ticket(1,"a","car","c"));eq(lot.park("b","car"),null);eq(lot.release(1),t);eq(lot.release(1),null);eq(lot.park("b","car").ticketId(),2L);});
            test("duplicate and invalid requests are atomic", () -> {var lot=new Exercise.ParkingLot(list(new Exercise.Spot("a","car"),new Exercise.Spot("b","van")));lot.park("x","car");error(IllegalArgumentException.class,()->lot.park("x","car"));error(IllegalArgumentException.class,()->lot.park("","car"));eq(lot.activeTickets().size(),1);eq(lot.park("y","van").ticketId(),2L);});
            test("inventory copy snapshots and independent lots", () -> {var spots=list(new Exercise.Spot("v","van"),new Exercise.Spot("c","car"));var lot=new Exercise.ParkingLot(spots);spots.clear();var free=lot.availableSpots();eq(free.get(0).id(),"c");free.clear();eq(lot.availableSpots().size(),2);eq(new Exercise.ParkingLot(list()).park("x","van"),null);});
            test("bounded release cycles", () -> {var lot=new Exercise.ParkingLot(list(new Exercise.Spot("m","motorcycle")));for(int i=1;i<=50;i++){var t=lot.park("v","motorcycle");eq(t.ticketId(),(long)i);yes(lot.availableSpots().isEmpty());lot.release(i);eq(lot.availableSpots().size(),1);}});
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
