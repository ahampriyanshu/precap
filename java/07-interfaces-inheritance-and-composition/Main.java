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
            test("composition order empty and short-circuit on failure", () -> {eq(Exercise.applyAll(" x ",list(String::strip,s->s+"!")),"x!");eq(Exercise.applyAll("x",list()),"x");var failure=new IllegalStateException("same");try{Exercise.applyAll("x",list(s->{throw failure;},s->{throw new AssertionError();}));throw new AssertionError();}catch(IllegalStateException e){yes(e==failure);}});
        } else {
            test("deferred composition snapshots and repeated invocation", () -> {var calls=new java.util.concurrent.atomic.AtomicInteger();List<Exercise.Transform> transforms=list(s->{calls.incrementAndGet();return s.strip();},s->s+"!");var pipeline=Exercise.pipeline(transforms);eq(calls.get(),0);transforms.clear();eq(pipeline.apply(" x "),"x!");eq(pipeline.apply(" y "),"y!");eq(calls.get(),2);eq(Exercise.pipeline(list()).apply("z"),"z");});
            test("exceptions retain identity and stop composition", () -> {var failure=new IllegalArgumentException("same");var p=Exercise.pipeline(list(s->{throw failure;},s->{throw new AssertionError();}));try{p.apply("x");throw new AssertionError();}catch(IllegalArgumentException e){yes(e==failure);}});
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
