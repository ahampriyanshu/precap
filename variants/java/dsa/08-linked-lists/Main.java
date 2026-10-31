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
        test("head and adjacent removals", () -> { long[] a0=new long[]{1L,2L,3L,2L,4L}; long[] a1=new long[]{1L,2L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(3L,4L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("empty list", () -> { long[] a0=new long[]{}; long[] a1=new long[]{1L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("all values removed", () -> { long[] a0=new long[]{1L,1L}; long[] a1=new long[]{1L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("no blocked values", () -> { long[] a0=new long[]{1L,2L}; long[] a1=new long[]{}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(1L,2L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 0", () -> { long[] a0=new long[]{}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 1", () -> { long[] a0=new long[]{0L}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 2", () -> { long[] a0=new long[]{5L,3L}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(5L,3L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 3", () -> { long[] a0=new long[]{1L,1L,2L}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(2L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 4", () -> { long[] a0=new long[]{3L,3L,5L,0L}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(3L,3L,5L,0L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 5", () -> { long[] a0=new long[]{0L,2L,4L,5L,2L}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0L,2L,5L,2L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 6", () -> { long[] a0=new long[]{2L,5L,5L,4L,0L,2L}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(2L,5L,5L,0L,2L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 7", () -> { long[] a0=new long[]{1L,5L,5L,3L,3L,5L,5L}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(5L,5L,3L,3L,5L,5L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 8", () -> { long[] a0=new long[]{3L,4L,2L,2L,4L,4L,5L,4L}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(3L,2L,2L,5L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 9", () -> { long[] a0=new long[]{1L,1L,3L,5L,5L,0L,4L,4L,3L}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(3L,5L,5L,0L,3L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 10", () -> { long[] a0=new long[]{4L,1L,1L,0L,1L,5L,2L,0L,5L,4L}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0L,5L,2L,0L,5L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 11", () -> { long[] a0=new long[]{3L,3L,5L,1L,5L,5L,2L,1L,4L,5L,5L}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(3L,3L,5L,5L,5L,2L,5L,5L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 12", () -> { long[] a0=new long[]{5L,0L,0L,5L,3L,3L,1L,1L,2L,1L,5L,4L}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(5L,0L,0L,5L,3L,3L,2L,5L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 13", () -> { long[] a0=new long[]{4L,5L,2L,4L,4L,0L,0L,1L,0L,3L,1L,2L,5L}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(5L,2L,0L,0L,0L,3L,2L,5L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("linked list 14", () -> { long[] a0=new long[]{1L,0L,5L,4L,1L,3L,0L,0L,5L,0L,4L,5L,1L,5L}; long[] a1=new long[]{1L,4L}; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0L,5L,3L,0L,0L,5L,0L,5L,5L)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("detach preserves identities across adjacent and head removal", () -> { var d=new Exercise.Node(4,null);var c=new Exercise.Node(2,d);var b=new Exercise.Node(2,c);var a=new Exercise.Node(1,b);var denied=new HashSet<>(list(1L,2L));yes(Exercise.detach(a,denied)==d);yes(d.next==null);eq(denied,new HashSet<>(list(1L,2L))); });
        test("detach middle tail empty and all", () -> { var c=new Exercise.Node(3,null);var b=new Exercise.Node(2,c);var a=new Exercise.Node(1,b);yes(Exercise.detach(a,new HashSet<>(list(2L,3L)))==a);yes(a.next==null);eq(Exercise.detach(null,Set.of()),null);eq(Exercise.detach(a,Set.of(1L)),null); });
        if(!prototype) test("final scale and structure boundary", () -> { Exercise.Node head=null;for(int i=9999;i>=0;i--)head=new Exercise.Node(i,head);var current=Exercise.detach(head,Set.of(0L,9999L));for(long i=1;i<9999;i++){yes(current!=null);eq(current.value,i);current=current.next;}eq(current,null); });
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
