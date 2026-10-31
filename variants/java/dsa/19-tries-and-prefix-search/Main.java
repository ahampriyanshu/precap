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
        test("terminal and duplicate", () -> { List<String> a0=list("cold","colder","coal","cold"); String a1="co"; int a2=3; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list("coal","cold","colder")); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("empty word and case", () -> { List<String> a0=list("","A","a"); String a1=""; int a2=9; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list("","A","a")); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("empty word list", () -> { List<String> a0=list(); String a1="x"; int a2=2; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list()); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("zero limit", () -> { List<String> a0=list("a"); String a1="a"; int a2=0; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list()); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("prefix='' limit=1", () -> { List<String> a0=list("caa","a","cabb","ac","ccb","bbb","cb","baab","c","c","","","bcba","bbaa","aa","a","ab","cab","a","ccc"); String a1=""; int a2=1; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list("")); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("prefix='' limit=3", () -> { List<String> a0=list("aab","aaa","a","bca","ccac","c","c","","caaa","","acb","","bcaa","cb","aa","a","cca","","","cbab"); String a1=""; int a2=3; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list("","a","aa")); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("prefix='' limit=8", () -> { List<String> a0=list("bb","","b","ccb","c","aa","cac","","","bc","a","c","a","a","bbb","ccca","ac","c","bcc","bc"); String a1=""; int a2=8; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list("","a","aa","ac","b","bb","bbb","bc")); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("prefix='a' limit=1", () -> { List<String> a0=list("","","bcba","aa","","b","","acbc","bcb","","","b","bbbb","aaa","","a","bb","b","aac","bcb"); String a1="a"; int a2=1; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list("a")); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("prefix='a' limit=3", () -> { List<String> a0=list("bbaa","cba","","","aca","","b","ca","c","a","a","c","ca","acac","b","bcb","abc","acba","bba","bb"); String a1="a"; int a2=3; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list("a","abc","aca")); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("prefix='a' limit=8", () -> { List<String> a0=list("aa","cc","bc","abb","c","","","","c","bcaa","c","bb","cbc","ba","baba","aba","ac","","cba","c"); String a1="a"; int a2=8; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list("aa","aba","abb","ac")); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("prefix='ab' limit=1", () -> { List<String> a0=list("a","bab","cac","baa","a","c","","bac","","ccb","bccb","ac","cb","bbab","c","bb","","","accb","ab"); String a1="ab"; int a2=1; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list("ab")); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("prefix='ab' limit=3", () -> { List<String> a0=list("cbaa","","ba","ccc","bc","aacb","cbb","ac","baba","a","cacb","ccc","aca","b","","a","c","bbc","baba",""); String a1="ab"; int a2=3; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list()); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("prefix='ab' limit=8", () -> { List<String> a0=list("b","a","ca","ba","cbc","acaa","b","cc","bbca","b","","baa","a","","c","","c","c","bab","c"); String a1="ab"; int a2=8; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list()); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("prefix='z' limit=1", () -> { List<String> a0=list("a","ccb","cbb","cb","a","","bb","cc","","cca","cbbb","","acba","cab","","","","cc","bac","ba"); String a1="z"; int a2=1; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list()); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("prefix='z' limit=3", () -> { List<String> a0=list("","bcc","","c","ac","ac","aab","cba","bbcc","b","abac","ba","bba","abcc","c","ac","","a","bbcc","cbb"); String a1="z"; int a2=3; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list()); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("prefix='z' limit=8", () -> { List<String> a0=list("cab","c","a","ab","c","","","aabb","c","aa","a","cac","cba","","","cb","ac","ac","",""); String a1="z"; int a2=8; String before=show(new Object[]{a0,a1,a2}); try { eq(prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2),list()); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });
        test("invalid input", () -> { List<String> a0=list("a"); String a1=""; int a2=-1; String before=show(new Object[]{a0,a1,a2}); try { error(IllegalArgumentException.class, () -> { Object ignored = prototype ? Exercise.prototype(a0,a1,a2) : Exercise.solve(a0,a1,a2); }); } finally { eq(show(new Object[]{a0,a1,a2}),before); } });

        if(!prototype) test("final scale and structure boundary", () -> { List<String> a=new ArrayList<>();for(int i=9999;i>=0;i--)a.add(String.format(Locale.ROOT,"word%05d",i));eq(Exercise.solve(a,"word09",3),list("word09000","word09001","word09002")); });
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
