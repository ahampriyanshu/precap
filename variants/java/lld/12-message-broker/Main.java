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
            test("FIFO lifetime deduplication and independent queues", () -> {var q=new Exercise.MessageQueue();yes(q.publish("",""));yes(q.publish("b","B"));eq(q.consume(),new Exercise.Message("",""));yes(!q.publish("","replaced"));eq(q.consume(),new Exercise.Message("b","B"));eq(q.consume(),null);eq(new Exercise.MessageQueue().consume(),null);});
        } else {
            test("group progress repeated polls and old messages", () -> {var b=new Exercise.MessageBroker(2);b.publish("a","A");b.publish("b","B");b.subscribe("x");b.subscribe("y");eq(b.poll("x"),new Exercise.Delivery("a","A",1));eq(b.poll("x"),new Exercise.Delivery("a","A",1));yes(!b.ack("x","b"));yes(b.ack("x","a"));eq(b.poll("y").id(),"a");eq(b.poll("x").id(),"b");yes(!b.subscribe("x"));yes(!b.publish("a","new"));});
            test("retry blocking attempt limits and exactly one DLQ record", () -> {var b=new Exercise.MessageBroker(2);b.publish("a","A");b.publish("b","B");b.subscribe("g");b.poll("g");eq(b.nack("g","a"),"retry");yes(!b.ack("g","a"));eq(b.nack("g","a"),null);eq(b.poll("g"),new Exercise.Delivery("a","A",2));eq(b.nack("g","a"),"dead-letter");eq(b.deadLetters("g"),list(new Exercise.DeadLetter("a","A",2)));eq(b.nack("g","a"),null);eq(b.poll("g"),new Exercise.Delivery("b","B",1));b.deadLetters("g").clear();eq(b.deadLetters("g").size(),1);});
            test("one attempt unknown groups and constructor validation", () -> {error(IllegalArgumentException.class,()->new Exercise.MessageBroker(0));var b=new Exercise.MessageBroker(1);eq(b.poll("unknown"),null);eq(b.deadLetters("unknown"),list());b.publish("a","A");b.subscribe("g");b.poll("g");eq(b.nack("g","a"),"dead-letter");eq(b.poll("g"),null);});
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
