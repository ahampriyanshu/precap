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
            test("draft deep ownership and shape", () -> {var a=list("x");var d=new Exercise.RecipeDraft("",a,list());a.clear();var out=d.snapshot();eq(out,new Exercise.Draft("",list("x"),list()));out.ingredients().clear();eq(d.snapshot().ingredients(),list("x"));});
        } else {
            test("permissions IDs and duplicate users", () -> {var m=new Exercise.RecipeManager();m.addUser("w",list("write"));m.addUser("r",list("read"));eq(m.add("r","bad",list(),list()),null);eq(m.add("w","A",list("x"),list()),"recipe1");eq(m.get("w","recipe1",null),null);yes(!m.addUser("r",list("write")));eq(m.add("r","B",list(),list()),null);error(IllegalArgumentException.class,()->m.addUser("r",list("admin")));error(IllegalArgumentException.class,()->m.add("none","",list(),list()));eq(m.get("r","recipe1",1).name(),"A");});
            test("immutable history rollback name collision and latest ingredients", () -> {var m=new Exercise.RecipeManager();m.addUser("u",list("read","write"));var ingredients=list("x","x");String id=m.add("u","A",ingredients,list("step"));ingredients.clear();eq(m.update("u",id,"B",list("y"),list()),2);eq(m.get("u",id,1).ingredients(),list("x","x"));m.add("u","A",list("x"),list());eq(m.rollback("u",id,1),null);eq(m.update("u","recipe2","C",list("x"),list()),2);eq(m.rollback("u",id,1),3);eq(m.history("u",id).size(),3);eq(m.byIngredient("u","x"),list("recipe2","recipe1"));});
            test("revision snapshots nested lists and independent managers", () -> {var m=new Exercise.RecipeManager();m.addUser("u",list("read","write"));String id=m.add("u","A",list("x"),list("s"));m.get("u",id,null).steps().clear();m.history("u",id).get(0).ingredients().clear();m.history("u",id).clear();eq(m.get("u",id,1).ingredients(),list("x"));eq(m.get("u",id,0),null);eq(new Exercise.RecipeManager().history("u",id),list());});
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
