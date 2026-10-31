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
            test("sequential ordering empty and exception identity", () -> {var calls=new ArrayList<Integer>();List<Callable<Integer>> tasks=list(()->{calls.add(1);return 1;},()->{calls.add(2);return 2;});eq(Exercise.runSequential(tasks),list(1,2));eq(calls,list(1,2));eq(Exercise.runSequential(list()),list());var failure=new Exception("same");try{Exercise.runSequential(list(()->{throw failure;},()->{throw new AssertionError();}));throw new AssertionError();}catch(Exception e){yes(e==failure);}});
        } else {
            test("true overlap and result order", () -> {var started=new CountDownLatch(2);List<Callable<Integer>> tasks=list(()->{started.countDown();yes(started.await(2,TimeUnit.SECONDS));return 1;},()->{started.countDown();yes(started.await(2,TimeUnit.SECONDS));return 2;});eq(Exercise.runConcurrent(tasks,2),list(1,2));eq(tasks.size(),2);eq(Exercise.runConcurrent(list(),1),list());});
            test("failure identity cancels sibling and finishes cleanup", () -> {var started=new CountDownLatch(1);var stopped=new CountDownLatch(1);var failure=new Exception("same");List<Callable<Integer>> tasks=list(()->{yes(started.await(2,TimeUnit.SECONDS));throw failure;},()->{started.countDown();try{new CountDownLatch(1).await();return 1;}finally{stopped.countDown();}});try{Exercise.runConcurrent(tasks,2);throw new AssertionError();}catch(Exception e){yes(e==failure);}yes(stopped.await(2,TimeUnit.SECONDS));});
            test("invalid worker count before work", () -> {var calls=new java.util.concurrent.atomic.AtomicInteger();error(IllegalArgumentException.class,()->Exercise.runConcurrent(list(()->calls.incrementAndGet()),0));eq(calls.get(),0);});
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
