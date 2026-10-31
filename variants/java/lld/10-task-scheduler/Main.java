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
            test("priority FIFO ties and lifetime IDs", () -> {var q=new Exercise.PriorityQueue();eq(q.pop(),null);eq(q.add("a",1),1L);q.add("b",2);q.add("c",2);eq(q.pop(),new Exercise.TaskItem(2,"b"));eq(q.pop(),new Exercise.TaskItem(3,"c"));eq(q.pop(),new Exercise.TaskItem(1,"a"));eq(q.add("a",-1),4L);});
        } else {
            test("priority dispatch quotas and token allocation", () -> {var s=new Exercise.TaskScheduler();long a=s.addTask("low",1),b=s.addTask("high",2);yes(s.addWorker("w",1));yes(!s.addWorker("w",99));eq(s.dispatch(0,"missing",2),null);var t=s.dispatch(0,"w",2);eq(t.id(),b);eq(t.token(),1L);eq(s.dispatch(0,"w",2),null);yes(s.complete(1,b,1));eq(s.dispatch(1,"w",2).id(),a);});
            test("exact expiry stale completion and new lease", () -> {var s=new Exercise.TaskScheduler();long id=s.addTask("a",1);s.addWorker("w",1);var old=s.dispatch(0,"w",3);eq(s.getTask(3,id).status(),"pending");var next=s.dispatch(3,"w",2);eq(next.token(),2L);yes(!s.complete(3,id,old.token()));eq(s.getTask(3,id).status(),"running");yes(s.complete(4,id,next.token()));eq(s.getTask(4,id),new Exercise.Task(id,"a",1,"done",null,null,null));});
            test("invalid requests preserve clock and assignments", () -> {var s=new Exercise.TaskScheduler();long id=s.addTask("a",0);s.addWorker("w",1);s.dispatch(1,"w",2);error(IllegalArgumentException.class,()->s.dispatch(10,"w",0));eq(s.getTask(2,id).status(),"running");error(IllegalArgumentException.class,()->s.getTask(1,id));eq(s.getTask(2,id).status(),"running");eq(s.dispatch(5,"unknown",1),null);error(IllegalArgumentException.class,()->s.getTask(4,id));});
            test("active snapshots independent workers instances and numeric ties", () -> {var s=new Exercise.TaskScheduler();s.addWorker("a",20);s.addWorker("b",1);for(int i=0;i<12;i++)s.addTask("same",1);for(int i=1;i<=12;i++)eq(s.dispatch(0,"a",5).id(),(long)i);s.active(0,"a").clear();eq(s.active(0,"a").size(),12);eq(s.active(0,"b"),list());eq(new Exercise.TaskScheduler().getTask(0,1),null);});
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
