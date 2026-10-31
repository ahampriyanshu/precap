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
        test("overlapping matches", () -> { String a0="ababa"; String a1="aba"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,2)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("repeated prefix", () -> { String a0="aaaaa"; String a1="aa"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1,2,3)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("all boundaries", () -> { String a0="abc"; String a1=""; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1,2,3)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("empty text", () -> { String a0=""; String a1="x"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("unicode indices", () -> { String a0="ééé"; String a1="éé"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,1)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 0", () -> { String a0="aaaab"; String a1="bab"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 1", () -> { String a0="abaaab"; String a1="abb"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 2", () -> { String a0="babaaaa"; String a1="aab"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 3", () -> { String a0="bbbaabab"; String a1="bba"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(1)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 4", () -> { String a0="bbbbbabba"; String a1="aab"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 5", () -> { String a0="bbaaabbaab"; String a1="baa"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(1,6)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 6", () -> { String a0="aaababaabbb"; String a1="abb"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(7)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 7", () -> { String a0="abaabaabbbab"; String a1="bba"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(8)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 8", () -> { String a0="babaaabbbbaba"; String a1="bba"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(8)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 9", () -> { String a0="bbaabbaaaabbbb"; String a1="aaa"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(6,7)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 10", () -> { String a0="bbbaaabbaabaaab"; String a1="aaa"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(3,11)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 11", () -> { String a0="baabaaabaabaaabb"; String a1="bba"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 12", () -> { String a0="abbabbababbaababa"; String a1="bbb"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 13", () -> { String a0="baabbbbbaaabaaaaab"; String a1="aaa"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(8,12,13,14)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 14", () -> { String a0="bbbabbbbaaaabbaabaa"; String a1="abb"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(3,11)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 15", () -> { String a0="bbabbbabaaaababaabba"; String a1="aaa"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(8,9)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 16", () -> { String a0="ababaaabbbbbbaaabbbbb"; String a1="aaa"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(4,13)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated transcript 17", () -> { String a0="abbbabbbbaabbaababbbab"; String a1="abb"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(0,4,10,16)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        if(!prototype) {
        test("final: long repeated prefix", () -> { String a0="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab"; String a1="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),list(260)); } finally { eq(show(new Object[]{a0,a1}),before); } });
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
