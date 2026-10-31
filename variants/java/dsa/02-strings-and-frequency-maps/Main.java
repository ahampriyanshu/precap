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
        test("multiplicity beats sets", () -> { String a0="ab"; String a1="aaa"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("a",2)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("case and punctuation", () -> { String a0="A-b 2"; String a1="BAAA!"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("a",2)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("empty strings", () -> { String a0=""; String a1=""; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("unicode letters", () -> { String a0="éÉ"; String a1="ééé"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("é",1)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("casefold expansion", () -> { String a0="ß"; String a1="SS"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 0", () -> { String a0=""; String a1=" a?A"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("a",2)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 1", () -> { String a0="C"; String a1="A AbB"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("a",2,"b",2)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 2", () -> { String a0="!a"; String a1="?  ?BB"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("b",2)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 3", () -> { String a0="c b"; String a1="?B abbb"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("a",1,"b",3)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 4", () -> { String a0="AAAa"; String a1=" BBa??AB"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("b",3)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 5", () -> { String a0=" !aca"; String a1="??AAbA c?"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("a",1,"b",1)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 6", () -> { String a0="bcaaaB"; String a1="ABAbcBbAaA"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("a",2,"b",2)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 7", () -> { String a0="C!BbA C"; String a1="?cbBbbaA ?A"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("a",2,"b",2)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 8", () -> { String a0="Cb!aBabA"; String a1=" b?bb abbba?"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("b",3)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 9", () -> { String a0="A!cAaC!aC"; String a1="ba?aB?Ba?A BB"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("b",5)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 10", () -> { String a0=" cB!cbBB c"; String a1=" bacAc?? Baaac"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("a",5)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 11", () -> { String a0="!baBBBabaa!"; String a1="  BA?BA cBAaAbA"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("a",2,"c",1)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 12", () -> { String a0="bB!bCbAAbbCc"; String a1=" bAAaABA a  BcBA"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("a",5)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 13", () -> { String a0="cCc!ba!bcbAcB"; String a1="aB?AA  b Babc aaB"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map("a",4,"b",1)); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("generated text 14", () -> { String a0="ABAaBaBaBCcCb!"; String a1="A ABcB ?A?c?BAc b?"; String before=show(new Object[]{a0,a1}); try { eq(prototype ? Exercise.prototype(a0,a1) : Exercise.solve(a0,a1),map()); } finally { eq(show(new Object[]{a0,a1}),before); } });
        test("code point keys and deterministic order", () -> { var r=prototype?Exercise.prototype("", "z𐐀a"):Exercise.solve("", "z𐐀a"); eq(new ArrayList<>(r.keySet()),list("a","z","𐐨")); });
        if(!prototype) test("final scale and structure boundary", () -> { eq(Exercise.solve("Ab".repeat(10000),"aB".repeat(10001)),map("a",1,"b",1)); });
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
