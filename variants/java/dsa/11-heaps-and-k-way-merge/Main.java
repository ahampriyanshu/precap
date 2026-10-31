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
        test("ties and empty sequence", () -> { List<List<Long>> a0=list(list(),list(1L,4L),list(1L,2L,8L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(1L,1L,2L,4L,8L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("no sequences", () -> { List<List<Long>> a0=list(); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list()); } finally { eq(show(new Object[]{a0}),before); } });
        test("all empty", () -> { List<List<Long>> a0=list(list(),list()); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list()); } finally { eq(show(new Object[]{a0}),before); } });
        test("1 feeds", () -> { List<List<Long>> a0=list(list(-8L,14L,16L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-8L,14L,16L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("2 feeds", () -> { List<List<Long>> a0=list(list(-9L,-8L,-7L,-6L),list()); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-9L,-8L,-7L,-6L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("3 feeds", () -> { List<List<Long>> a0=list(list(-5L,0L,4L,14L),list(-7L,-5L,-3L,-2L,-1L,6L,15L),list(1L,3L,5L,6L,16L,18L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-7L,-5L,-5L,-3L,-2L,-1L,0L,1L,3L,4L,5L,6L,6L,14L,15L,16L,18L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("4 feeds", () -> { List<List<Long>> a0=list(list(-10L,-7L,4L,5L,9L,10L,18L),list(),list(-1L,-1L,-1L,9L,16L,18L),list(-8L,0L,14L,18L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-10L,-8L,-7L,-1L,-1L,-1L,0L,4L,5L,9L,9L,10L,14L,16L,18L,18L,18L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("5 feeds", () -> { List<List<Long>> a0=list(list(-7L,16L,17L),list(),list(13L),list(-1L,0L),list(2L,17L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-7L,-1L,0L,2L,13L,16L,17L,17L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("6 feeds", () -> { List<List<Long>> a0=list(list(-9L),list(3L),list(-5L,-4L,4L),list(-3L),list(-10L,-9L,12L),list(-10L,-7L,-6L,-2L,1L,14L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-10L,-10L,-9L,-9L,-7L,-6L,-5L,-4L,-3L,-2L,1L,3L,4L,12L,14L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("7 feeds", () -> { List<List<Long>> a0=list(list(0L,4L,5L,19L),list(1L,8L),list(-10L,-1L,5L,5L,7L,15L,17L),list(16L),list(0L,0L,5L,17L),list(-7L),list(-4L,0L,1L,2L,7L,19L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-10L,-7L,-4L,-1L,0L,0L,0L,0L,1L,1L,2L,4L,5L,5L,5L,5L,7L,7L,8L,15L,16L,17L,17L,19L,19L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("8 feeds", () -> { List<List<Long>> a0=list(list(5L,16L,16L,17L),list(-5L,9L,11L),list(-2L,2L,18L,19L),list(-10L,-6L,11L,15L,15L,19L),list(-3L,-1L,6L,10L),list(-9L,-3L,4L,4L,10L,12L),list(-8L,-2L,10L,16L),list(6L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-10L,-9L,-8L,-6L,-5L,-3L,-3L,-2L,-2L,-1L,2L,4L,4L,5L,6L,6L,9L,10L,10L,10L,11L,11L,12L,15L,15L,16L,16L,16L,17L,18L,19L,19L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("9 feeds", () -> { List<List<Long>> a0=list(list(17L),list(-9L,-8L,-1L,4L,8L,12L),list(-10L,-8L,0L,5L,18L,19L),list(7L,8L,12L),list(-7L,-7L,-1L,10L,11L,15L,17L),list(0L,4L,8L,10L,11L,16L,18L),list(-10L,-1L,17L),list(-10L,-10L,13L),list(-4L,-3L,-1L,11L,13L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-10L,-10L,-10L,-10L,-9L,-8L,-8L,-7L,-7L,-4L,-3L,-1L,-1L,-1L,-1L,0L,0L,4L,4L,5L,7L,8L,8L,8L,10L,10L,11L,11L,11L,12L,12L,13L,13L,15L,16L,17L,17L,17L,18L,18L,19L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("10 feeds", () -> { List<List<Long>> a0=list(list(7L,10L,17L),list(-4L,-2L,6L,11L,15L),list(-9L,-7L,4L,4L,5L,12L,12L),list(-2L),list(-8L,10L),list(4L,8L,19L),list(-9L,-8L,-6L,-3L,-1L,0L),list(-8L,-5L,5L,6L,8L,13L),list(-10L,-6L,-2L,-2L,4L,15L,16L),list(-3L,-3L,3L,4L,8L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-10L,-9L,-9L,-8L,-8L,-8L,-7L,-6L,-6L,-5L,-4L,-3L,-3L,-3L,-2L,-2L,-2L,-2L,-1L,0L,3L,4L,4L,4L,4L,4L,5L,5L,6L,6L,7L,8L,8L,8L,10L,10L,11L,12L,12L,13L,15L,15L,16L,17L,19L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("11 feeds", () -> { List<List<Long>> a0=list(list(0L,0L,4L,6L),list(-9L,1L,5L,9L,16L),list(-4L,0L,4L,7L,13L,16L),list(-6L,-5L,-3L,5L),list(18L),list(),list(-8L,1L,5L,10L,12L,18L),list(4L,19L),list(-1L,4L,16L),list(-6L,-3L,1L,15L),list(-10L,-9L,-9L,-7L,5L,7L,11L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-10L,-9L,-9L,-9L,-8L,-7L,-6L,-6L,-5L,-4L,-3L,-3L,-1L,0L,0L,0L,1L,1L,1L,4L,4L,4L,4L,5L,5L,5L,5L,6L,7L,7L,9L,10L,11L,12L,13L,15L,16L,16L,16L,18L,18L,19L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("12 feeds", () -> { List<List<Long>> a0=list(list(-8L,-8L,-1L,5L,18L),list(-1L,3L,5L,10L),list(-9L,-7L,-2L,0L,1L,13L,14L),list(-4L,15L),list(-4L,1L,4L,4L,8L,13L),list(-9L,-2L,4L,11L,17L,18L,19L),list(-4L,6L,16L,16L),list(1L,16L),list(),list(),list(-9L,-7L,2L,7L,8L),list(-8L,10L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-9L,-9L,-9L,-8L,-8L,-8L,-7L,-7L,-4L,-4L,-4L,-2L,-2L,-1L,-1L,0L,1L,1L,1L,2L,3L,4L,4L,4L,5L,5L,6L,7L,8L,8L,10L,10L,11L,13L,13L,14L,15L,16L,16L,16L,17L,18L,18L,19L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("13 feeds", () -> { List<List<Long>> a0=list(list(),list(0L,5L,6L,8L,15L),list(-7L),list(-9L,-7L,-1L,7L,19L),list(-9L,-8L,6L,15L),list(-5L,2L,3L,10L,14L),list(-9L,-6L,-6L,13L,18L),list(-1L,0L,4L,8L,15L,16L),list(-10L,-4L,3L,15L,17L),list(-8L,0L,4L,6L,11L),list(-10L,-6L,-4L),list(8L),list(-10L,-6L,11L,17L,17L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-10L,-10L,-10L,-9L,-9L,-9L,-8L,-8L,-7L,-7L,-6L,-6L,-6L,-6L,-5L,-4L,-4L,-1L,-1L,0L,0L,0L,2L,3L,3L,4L,4L,5L,6L,6L,6L,7L,8L,8L,8L,10L,11L,11L,13L,14L,15L,15L,15L,15L,16L,17L,17L,17L,18L,19L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("14 feeds", () -> { List<List<Long>> a0=list(list(-2L,1L,11L,13L,13L,14L,18L),list(-5L,18L),list(-5L),list(-10L,-2L,0L,5L,11L,13L,14L),list(-7L,4L,5L,13L,16L),list(-7L,-1L,9L,16L),list(),list(16L),list(4L,5L,6L,19L),list(),list(-8L,0L,1L,3L,7L,18L),list(),list(6L,10L,10L,13L,16L),list(-9L,-8L,-1L,19L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-10L,-9L,-8L,-8L,-7L,-7L,-5L,-5L,-2L,-2L,-1L,-1L,0L,0L,1L,1L,3L,4L,4L,5L,5L,5L,6L,6L,7L,9L,10L,10L,11L,11L,13L,13L,13L,13L,13L,14L,14L,16L,16L,16L,16L,18L,18L,18L,19L,19L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("15 feeds", () -> { List<List<Long>> a0=list(list(-1L,11L,13L),list(-8L,2L,10L),list(-10L,-4L,-1L,2L,6L,8L,9L),list(4L),list(-6L,-2L,3L,3L,7L,16L,16L),list(),list(-3L,7L,14L,18L),list(-8L,-6L,1L,15L,16L,16L),list(16L),list(2L,6L,6L,8L,13L,17L),list(-5L,-4L,10L),list(-3L,-3L,1L,8L,12L,18L),list(-3L,7L,13L,15L,16L),list(-9L,-9L,-2L,0L,1L,3L),list(-2L,4L,4L,8L,17L,18L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-10L,-9L,-9L,-8L,-8L,-6L,-6L,-5L,-4L,-4L,-3L,-3L,-3L,-3L,-2L,-2L,-2L,-1L,-1L,0L,1L,1L,1L,2L,2L,2L,3L,3L,3L,4L,4L,4L,6L,6L,6L,7L,7L,7L,8L,8L,8L,8L,9L,10L,10L,11L,12L,13L,13L,13L,14L,15L,15L,16L,16L,16L,16L,16L,16L,17L,17L,18L,18L,18L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("16 feeds", () -> { List<List<Long>> a0=list(list(-10L,10L,14L),list(-9L,-6L,11L,17L),list(2L),list(-8L,-2L,13L,17L,18L),list(-8L,-6L,3L,16L),list(-9L,-6L,9L,9L,12L,15L),list(-5L,5L,10L,16L,19L),list(-8L,-4L,15L,19L),list(6L,19L),list(-2L,-1L,8L,11L,16L),list(),list(),list(),list(-6L,-5L,-1L,-1L,0L,9L,12L),list(-8L,-6L,-6L),list(1L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-10L,-9L,-9L,-8L,-8L,-8L,-8L,-6L,-6L,-6L,-6L,-6L,-6L,-5L,-5L,-4L,-2L,-2L,-1L,-1L,-1L,0L,1L,2L,3L,5L,6L,8L,9L,9L,9L,10L,10L,11L,11L,12L,12L,13L,14L,15L,15L,16L,16L,16L,17L,17L,18L,19L,19L,19L)); } finally { eq(show(new Object[]{a0}),before); } });
        test("17 feeds", () -> { List<List<Long>> a0=list(list(-10L,-9L,3L),list(-9L,-3L,-1L,14L),list(2L,5L,15L),list(-5L,5L),list(-7L,-3L,16L,18L),list(13L,19L),list(-6L,19L),list(-3L,-3L,7L,9L,11L,14L),list(),list(),list(-7L,5L,7L,7L,8L,9L),list(-9L,15L),list(),list(-9L,-4L,-4L,5L,10L,14L,15L),list(-1L,1L,9L,9L,9L),list(-2L,-1L,5L,9L,14L),list(-5L,3L)); String before=show(new Object[]{a0}); try { eq(prototype ? Exercise.prototype(a0) : Exercise.solve(a0),list(-10L,-9L,-9L,-9L,-9L,-7L,-7L,-6L,-5L,-5L,-4L,-4L,-3L,-3L,-3L,-3L,-2L,-1L,-1L,-1L,1L,2L,3L,3L,5L,5L,5L,5L,5L,7L,7L,7L,8L,9L,9L,9L,9L,9L,9L,10L,11L,13L,14L,14L,14L,14L,15L,15L,15L,16L,18L,19L,19L)); } finally { eq(show(new Object[]{a0}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { List<List<Long>> feeds=new ArrayList<>();for(int f=0;f<100;f++){List<Long> row=new ArrayList<>();for(int i=0;i<100;i++)row.add((long)i*100+f);feeds.add(row);}var out=Exercise.solve(feeds);eq(out.size(),10000);for(int i=0;i<out.size();i++)eq(out.get(i),(long)i); });
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
