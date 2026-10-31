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
    static class TrackingReader extends java.io.StringReader {
        int closed; final boolean fail;
        TrackingReader(String s,boolean fail){super(s);this.fail=fail;}
        public void close(){closed++;super.close();if(fail)Main.<RuntimeException>sneaky(new java.io.IOException("close"));}
    }
    @SuppressWarnings("unchecked") static <E extends Throwable> void sneaky(Throwable e) throws E {throw (E)e;}
    static void suites() throws Exception {
        if(prototype) {
            test("signed parse and retained number-format cause", () -> {eq(Exercise.parseValue(" -3 "),-3L);try{Exercise.parseValue("bad");throw new AssertionError();}catch(IllegalArgumentException e){yes(e.getCause() instanceof NumberFormatException);}error(IllegalArgumentException.class,()->Exercise.parseValue(""));});
        } else {
            test("streamed total empty lines and close once", () -> {var r=new TrackingReader("1\n\n -2\n3",false);eq(Exercise.total(r),2L);eq(r.closed,1);var empty=new TrackingReader("",false);eq(Exercise.total(empty),0L);eq(empty.closed,1);});
            test("parse failure closes and suppresses cleanup failure", () -> {var r=new TrackingReader("bad",true);try{Exercise.total(r);throw new AssertionError();}catch(IllegalArgumentException e){yes(e.getCause() instanceof NumberFormatException);eq(e.getSuppressed().length,1);yes(e.getSuppressed()[0] instanceof java.io.IOException);}eq(r.closed,1);});
            test("IO failure propagates and close still occurs", () -> {var r=new java.io.Reader(){boolean closed;public int read(char[] b,int o,int n)throws java.io.IOException{throw new java.io.IOException("read");}public void close(){closed=true;}};error(java.io.IOException.class,()->Exercise.total(r));yes(r.closed);});
            test("overflow closes", () -> {var r=new TrackingReader("9223372036854775807\n1",false);error(ArithmeticException.class,()->Exercise.total(r));eq(r.closed,1);});
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
