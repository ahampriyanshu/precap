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
        test("three different edits", () -> { String a0="kitten"; String a1="sitting"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("no transposition shortcut", () -> { String a0="ab"; String a1="ba"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),2); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("empty boundary", () -> { String a0=""; String a1="abc"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("no normalization", () -> { String a0="é"; String a1="e"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),1); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("string pair 0", () -> { String a0=""; String a1="abacca"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),6); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("string pair 1", () -> { String a0="c"; String a1="bcabbb"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),5); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("string pair 2", () -> { String a0="ac"; String a1="bcabca"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),4); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("string pair 3", () -> { String a0="aca"; String a1="cbbcab"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),4); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("string pair 4", () -> { String a0="babb"; String a1="cbaaba"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("string pair 5", () -> { String a0="baccc"; String a1="abcbcb"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),4); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("string pair 6", () -> { String a0="baccbc"; String a1="baabba"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),3); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("string pair 7", () -> { String a0="aabbcba"; String a1="cbaaaa"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),5); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("string pair 8", () -> { String a0="bbbbabba"; String a1="bcaccc"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),6); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("string pair 9", () -> { String a0="acaabbbbb"; String a1="ababbc"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),5); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("string pair 10", () -> { String a0="ccbbcccbbc"; String a1="bccaca"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),7); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("string pair 11", () -> { String a0="aababcabbcc"; String a1="bccbcc"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),6); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("string pair 12", () -> { String a0="cababbaabccc"; String a1="bbaaba"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),7); } finally { eq(show(new Object[]{a0,a1}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { eq(Exercise.solve("a".repeat(1000),"a".repeat(999)),1); });
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
