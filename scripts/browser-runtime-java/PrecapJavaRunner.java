// Derived from cyberspace-cs/zero2Leetcode @ 193ea2aa099ba4b442809341d8fd3bb155137bab.
// Upstream README declares MIT License, copyright 2026. Preserve attribution and notices.
package precap.runtime;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintStream;
import java.io.StringWriter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.SecureClassLoader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.FileObject;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileManager;
import javax.tools.JavaFileObject;
import javax.tools.SimpleJavaFileObject;
import javax.tools.StandardLocation;


/** Compiles and runs a single ACM-style Main.java entirely inside CheerpJ. */
public final class PrecapJavaRunner {
    private static final int MIN_OUTPUT_BYTES = 1024;
    private static final JavaCompiler COMPILER = createCompiler();
    private static final PlatformClassPath PLATFORM_CLASSES = PlatformClassPath.load();

    private PrecapJavaRunner() {}

    private static JavaCompiler createCompiler() {
        try { return (JavaCompiler) Class.forName("org.eclipse.jdt.internal.compiler.tool.EclipseCompiler").getConstructor().newInstance(); }
        catch (Exception e) { throw new ExceptionInInitializerError(e); }
    }
    private static final class ExitSignal extends SecurityException {
        final int status;
        ExitSignal(int status) { super("Program exited with code " + status); this.status = status; }
    }
    @SuppressWarnings("removal")
    private static final class ExitGuard extends SecurityManager {
        public void checkPermission(java.security.Permission permission) {}
        public void checkExit(int status) { throw new ExitSignal(status); }
    }


    public static String warmup() {
        CompilationResult result = compile("final class Z2LWarmup {}", "Z2LWarmup.java");
        return result.success ? "ok" : result.errors;
    }

    private static CompilationResult prepared;

    public static synchronized String compileSources(String[] fileNames, String[] sourceContents) {
        prepared = null;
        if(fileNames.length == 0) return result("", "Provide at least one Java source file.", null, "compile", false);
        prepared = compileFiles(fileNames, sourceContents);
        return result("", prepared.success ? null : prepared.errors, prepared.warnings, "compile", false);
    }

    public static synchronized String runPrepared(String[] args, int maxOutputBytes) {
        String stdin = "";
        CompilationResult compilation = prepared;
        prepared = null;
        if(compilation == null || !compilation.success)
            return result("", "Compile the Java source before running it.", null, "service", false);

        if (!compilation.classes.containsKey("Main")) {
            return result(
                "",
                "The compiled program must include a Main entry class.",
                compilation.warnings,
                "compile",
                false
            );
        }

        int outputLimit = Math.max(MIN_OUTPUT_BYTES, maxOutputBytes);
        OutputBudget outputBudget = new OutputBudget(outputLimit);
        LimitedOutputStream stdoutBuffer = new LimitedOutputStream(outputBudget);
        LimitedOutputStream stderrBuffer = new LimitedOutputStream(outputBudget);
        PrintStream stdout;
        PrintStream stderr;
        try {
            stdout = new PrintStream(stdoutBuffer, true, StandardCharsets.UTF_8.name());
            stderr = new PrintStream(stderrBuffer, true, StandardCharsets.UTF_8.name());
        } catch (Exception error) {
            return result("", stackTrace(error), compilation.warnings, "service", true);
        }

        ByteArrayInputStream input = new ByteArrayInputStream(
            (stdin == null ? "" : stdin).getBytes(StandardCharsets.UTF_8)
        );
        PrintStream originalOut = System.out;
        PrintStream originalErr = System.err;
        java.io.InputStream originalIn = System.in;
        SecurityManager originalSecurityManager = System.getSecurityManager();
        AtomicReference<Throwable> runtimeFailure = new AtomicReference<>();
        ThreadGroup userThreads = new ThreadGroup("z2l-java-user-code");

        try {
            System.setSecurityManager(new ExitGuard());
            System.setIn(input);
            System.setOut(stdout);
            System.setErr(stderr);

            MemoryClassLoader classLoader = new MemoryClassLoader(compilation.classes);
            Thread mainThread = new Thread(userThreads, () -> {
                try {
                    invokeMain(classLoader, args);
                } catch (Throwable error) {
                    Throwable actual=unwrap(error);
                    if (!(actual instanceof ExitSignal) || ((ExitSignal)actual).status!=0) runtimeFailure.set(actual);
                }
            }, "Main");
            mainThread.setContextClassLoader(classLoader);
            mainThread.start();
            mainThread.join();

            boolean leakedThreads = interruptRemainingThreads(userThreads);
            stdout.flush();
            stderr.flush();

            String stdoutText = stdoutBuffer.asString();
            String stderrText = stderrBuffer.asString();
            if (outputBudget.truncated) {
                return result(
                    stdoutText,
                    "Program output exceeded the configured limit.",
                    joinWarnings(compilation.warnings, stderrText),
                    "limit",
                    leakedThreads
                );
            }

            Throwable failure = runtimeFailure.get();
            if (failure != null) {
                String runtimeError = stackTrace(failure);
                return result(
                    stdoutText,
                    joinWarnings(stderrText, runtimeError),
                    compilation.warnings,
                    "runtime",
                    leakedThreads
                );
            }

            String threadWarning = leakedThreads
                ? "Background threads remain; the browser Java runtime will restart."
                : null;
            return result(
                stdoutText,
                null,
                joinWarnings(compilation.warnings, stderrText, threadWarning),
                null,
                leakedThreads
            );
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            return result(
                stdoutBuffer.asString(),
                "The Java execution thread was interrupted.",
                compilation.warnings,
                "runtime",
                true
            );
        } catch (Throwable error) {
            return result(
                stdoutBuffer.asString(),
                stackTrace(unwrap(error)),
                compilation.warnings,
                "runtime",
                true
            );
        } finally {
            System.setSecurityManager(originalSecurityManager);
            System.setIn(originalIn);
            System.setOut(originalOut);
            System.setErr(originalErr);
            stdout.close();
            stderr.close();
        }
    }

    private static synchronized CompilationResult compile(String source, String fileName) {
        return compileFiles(new String[]{fileName}, new String[]{source});
    }

    private static synchronized CompilationResult compileFiles(String[] fileNames, String[] sourceContents) {
        List<JavaFileObject> units = new ArrayList<>();
        for(int i=0;i<fileNames.length;i++) units.add(new SourceFile(fileNames[i], sourceContents[i]));
        System.setProperty("jdt.compiler.useSingleThread", "true");
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        MemoryFileManager manager = new MemoryFileManager();
        List<String> options = List.of(
            "-source", "17",
            "-target", "17",
            "-encoding", "UTF-8",
            "-proc:none",
            "-g:lines,source"
        );

        boolean success = false;
        String internalError = null;
        StringWriter compilerOutput = new StringWriter();
        String runtimeJavaVersion = System.getProperty("java.version");
        try {
            // CheerpJ 17 does not expose lib/modules. ECJ otherwise tries to open
            // that JRT image before consulting our JavaFileManager.
            System.setProperty("java.version", "1.8");
            JavaCompiler.CompilationTask task = COMPILER.getTask(
                compilerOutput,
                manager,
                diagnostics,
                options,
                null,
                units
            );
            success = Boolean.TRUE.equals(task.call());
        } catch (Throwable error) {
            internalError = "Java compiler error: " + error.getClass().getSimpleName() + ": " + error.getMessage();
        } finally {
            if (runtimeJavaVersion == null) {
                System.clearProperty("java.version");
            } else {
                System.setProperty("java.version", runtimeJavaVersion);
            }
            manager.close();
        }

        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        for (Diagnostic<? extends JavaFileObject> diagnostic : diagnostics.getDiagnostics()) {
            String formatted = formatDiagnostic(diagnostic);
            if (diagnostic.getKind() == Diagnostic.Kind.ERROR) {
                errors.add(formatted);
            } else if (diagnostic.getKind() == Diagnostic.Kind.WARNING ||
                       diagnostic.getKind() == Diagnostic.Kind.MANDATORY_WARNING) {
                warnings.add(formatted);
            }
        }
        if (internalError != null) errors.add(internalError);
        if (!success && errors.isEmpty() && !compilerOutput.toString().trim().isEmpty()) {
            errors.add(compilerOutput.toString().trim());
        }
        if (!success && errors.isEmpty()) errors.add("Java compilation failed.");

        return new CompilationResult(
            success && internalError == null,
            manager.classBytes(),
            String.join("\n", errors),
            warnings.isEmpty() ? null : String.join("\n", warnings)
        );
    }

    private static String formatDiagnostic(Diagnostic<? extends JavaFileObject> diagnostic) {
        JavaFileObject source = diagnostic.getSource();
        String name = source == null ? "Java" : source.getName();
        int slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        StringBuilder text = new StringBuilder(slash < 0 ? name : name.substring(slash + 1));
        if (diagnostic.getLineNumber() > 0) {
            text.append(':').append(diagnostic.getLineNumber());
            if (diagnostic.getColumnNumber() > 0) {
                text.append(':').append(diagnostic.getColumnNumber());
            }
        }
        text.append(": ").append(diagnostic.getMessage(Locale.ENGLISH));
        return text.toString();
    }

    private static void invokeMain(ClassLoader classLoader, String[] args) throws Throwable {
        Class<?> mainClass = Class.forName("Main", true, classLoader);
        Method main = mainClass.getMethod("main", String[].class);
        if (!Modifier.isStatic(main.getModifiers()) || main.getReturnType() != Void.TYPE) {
            throw new NoSuchMethodException("Main.main must be public static void main(String[] args).");
        }
        try {
            main.invoke(null, (Object) args);
        } catch (InvocationTargetException error) {
            throw error.getCause() == null ? error : error.getCause();
        }
    }

    private static Throwable unwrap(Throwable error) {
        if (error instanceof InvocationTargetException &&
            ((InvocationTargetException) error).getCause() != null) {
            return ((InvocationTargetException) error).getCause();
        }
        return error;
    }

    private static boolean interruptRemainingThreads(ThreadGroup group) {
        int estimate = Math.max(8, group.activeCount() * 2 + 4);
        Thread[] threads = new Thread[estimate];
        int count = group.enumerate(threads, true);
        boolean found = false;
        for (int i = 0; i < count; i++) {
            Thread thread = threads[i];
            if (thread != null && thread.isAlive()) {
                found = true;
                thread.interrupt();
            }
        }
        return found;
    }

    private static String stackTrace(Throwable error) {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        try (PrintStream stream = new PrintStream(buffer, true, StandardCharsets.UTF_8.name())) {
            error.printStackTrace(stream);
        } catch (Exception ignored) {
            return error.toString();
        }
        return new String(buffer.toByteArray(), StandardCharsets.UTF_8).trim();
    }

    private static String joinWarnings(String... parts) {
        StringBuilder joined = new StringBuilder();
        for (String part : parts) {
            if (part == null || part.trim().isEmpty()) continue;
            if (joined.length() > 0) joined.append('\n');
            joined.append(part.trim());
        }
        return joined.length() == 0 ? null : joined.toString();
    }

    private static String result(
        String stdout,
        String error,
        String warning,
        String phase,
        boolean restartRuntime
    ) {
        return "{" +
            "\"stdout\":" + jsonString(stdout == null ? "" : stdout) + "," +
            "\"error\":" + jsonString(error) + "," +
            "\"warning\":" + jsonString(warning) + "," +
            "\"warningLabel\":\"Java stderr\"," +
            "\"phase\":" + jsonString(phase) + "," +
            "\"restartRuntime\":" + restartRuntime +
            "}";
    }

    private static String jsonString(String value) {
        if (value == null) return "null";
        StringBuilder escaped = new StringBuilder(value.length() + 16);
        escaped.append('"');
        for (int i = 0; i < value.length(); i++) {
            char ch = value.charAt(i);
            switch (ch) {
                case '"': escaped.append("\\\""); break;
                case '\\': escaped.append("\\\\"); break;
                case '\b': escaped.append("\\b"); break;
                case '\f': escaped.append("\\f"); break;
                case '\n': escaped.append("\\n"); break;
                case '\r': escaped.append("\\r"); break;
                case '\t': escaped.append("\\t"); break;
                default:
                    if (ch < 0x20) {
                        escaped.append(String.format("\\u%04x", (int) ch));
                    } else {
                        escaped.append(ch);
                    }
            }
        }
        return escaped.append('"').toString();
    }

    private static final class CompilationResult {
        final boolean success;
        final Map<String, byte[]> classes;
        final String errors;
        final String warnings;

        CompilationResult(
            boolean success,
            Map<String, byte[]> classes,
            String errors,
            String warnings
        ) {
            this.success = success;
            this.classes = classes;
            this.errors = errors;
            this.warnings = warnings;
        }
    }

    private static final class SourceFile extends SimpleJavaFileObject {
        private final String source;

        SourceFile(String fileName, String source) {
            // ECJ attaches diagnostics only when the originating file exists.
            // The worker mounts this path in its transient in-memory /str VFS.
            super(URI.create("file:///str/" + fileName), JavaFileObject.Kind.SOURCE);
            this.source = source;
        }

        @Override
        public CharSequence getCharContent(boolean ignoreEncodingErrors) {
            return source;
        }
    }

    private static final class ClassFile extends SimpleJavaFileObject {
        private final String className;
        private final ByteArrayOutputStream bytes = new ByteArrayOutputStream();

        ClassFile(String className) {
            super(
                URI.create("mem:///" + className.replace('.', '/') + JavaFileObject.Kind.CLASS.extension),
                JavaFileObject.Kind.CLASS
            );
            this.className = className;
        }

        @Override
        public OutputStream openOutputStream() {
            return bytes;
        }

        @Override
        public InputStream openInputStream() {
            return new ByteArrayInputStream(bytes.toByteArray());
        }

        byte[] bytes() {
            return bytes.toByteArray();
        }
    }

    private static final class PlatformClassFile extends SimpleJavaFileObject {
        private static final String RESOURCE_ROOT = "/META-INF/java17-api/";
        private final String className;

        PlatformClassFile(String className) {
            super(
                URI.create("platform:///" + className.replace('.', '/') + Kind.CLASS.extension),
                Kind.CLASS
            );
            this.className = className;
        }

        @Override
        public InputStream openInputStream() throws IOException {
            String resourceName = RESOURCE_ROOT + className.replace('.', '/') + ".sig";
            InputStream input = PrecapJavaRunner.class.getResourceAsStream(resourceName);
            if (input == null) throw new IOException("Missing Java 17 API type: " + className);
            return input;
        }
    }

    private static final class PlatformClassPath {
        private static final String INDEX_RESOURCE = "/META-INF/java17-api.index";
        private final Map<String, PlatformClassFile> byName;
        private final Map<String, List<JavaFileObject>> byPackage;

        private PlatformClassPath(
            Map<String, PlatformClassFile> byName,
            Map<String, List<JavaFileObject>> byPackage
        ) {
            this.byName = byName;
            this.byPackage = byPackage;
        }

        static PlatformClassPath load() {
            Map<String, PlatformClassFile> byName = new LinkedHashMap<>();
            Map<String, List<JavaFileObject>> byPackage = new LinkedHashMap<>();
            InputStream raw = PrecapJavaRunner.class.getResourceAsStream(INDEX_RESOURCE);
            if (raw == null) {
                throw new IllegalStateException("The Java 17 API index is missing from the runtime package.");
            }

            try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(raw, StandardCharsets.UTF_8)
            )) {
                String className;
                while ((className = reader.readLine()) != null) {
                    className = className.trim();
                    if (className.isEmpty()) continue;
                    PlatformClassFile file = new PlatformClassFile(className);
                    byName.put(className, file);
                    int separator = className.lastIndexOf('.');
                    String packageName = separator < 0 ? "" : className.substring(0, separator);
                    byPackage.computeIfAbsent(packageName, ignored -> new ArrayList<>()).add(file);
                }
            } catch (IOException error) {
                throw new IllegalStateException("The Java 17 API index could not be read.", error);
            }

            Map<String, List<JavaFileObject>> immutablePackages = new LinkedHashMap<>();
            byPackage.forEach((name, files) ->
                immutablePackages.put(name, Collections.unmodifiableList(files))
            );
            return new PlatformClassPath(
                Collections.unmodifiableMap(byName),
                Collections.unmodifiableMap(immutablePackages)
            );
        }

        JavaFileObject find(String className) {
            return byName.get(className);
        }

        Iterable<JavaFileObject> list(String packageName, boolean recurse) {
            String normalizedPackage = packageName.replace('/', '.').replace('\\', '.');
            if (!recurse) {
                return byPackage.getOrDefault(normalizedPackage, Collections.emptyList());
            }
            List<JavaFileObject> files = new ArrayList<>();
            String prefix = normalizedPackage.isEmpty() ? "" : normalizedPackage + ".";
            byPackage.forEach((name, packageFiles) -> {
                if (name.equals(normalizedPackage) || name.startsWith(prefix)) files.addAll(packageFiles);
            });
            return files;
        }
    }

    private static final class MemoryFileManager implements JavaFileManager {
        private final Map<String, ClassFile> output = new LinkedHashMap<>();

        @Override
        public boolean hasLocation(JavaFileManager.Location location) {
            return location == StandardLocation.PLATFORM_CLASS_PATH ||
                location == StandardLocation.CLASS_PATH ||
                location == StandardLocation.SOURCE_PATH ||
                location == StandardLocation.CLASS_OUTPUT;
        }

        @Override
        public boolean contains(JavaFileManager.Location location, FileObject file) throws IOException {
            if (location == StandardLocation.PLATFORM_CLASS_PATH) {
                return file instanceof PlatformClassFile;
            }
            if (location == StandardLocation.SOURCE_PATH) return file instanceof SourceFile;
            if (location == StandardLocation.CLASS_OUTPUT) return file instanceof ClassFile;
            return false;
        }

        @Override
        public Iterable<JavaFileObject> list(
            JavaFileManager.Location location,
            String packageName,
            Set<JavaFileObject.Kind> kinds,
            boolean recurse
        ) throws IOException {
            if (!kinds.contains(JavaFileObject.Kind.CLASS)) return Collections.emptyList();
            if (location == StandardLocation.PLATFORM_CLASS_PATH) {
                return PLATFORM_CLASSES.list(packageName, recurse);
            }
            if (location == StandardLocation.CLASS_OUTPUT) {
                List<JavaFileObject> files = new ArrayList<>();
                String prefix = packageName.isEmpty() ? "" : packageName + ".";
                output.forEach((name, file) -> {
                    int separator = name.lastIndexOf('.');
                    String ownerPackage = separator < 0 ? "" : name.substring(0, separator);
                    if (ownerPackage.equals(packageName) ||
                        (recurse && ownerPackage.startsWith(prefix))) {
                        files.add(file);
                    }
                });
                return files;
            }
            if (location == StandardLocation.SOURCE_PATH) {
                return Collections.emptyList();
            }
            return Collections.emptyList();
        }

        @Override
        public JavaFileObject getJavaFileForInput(
            JavaFileManager.Location location,
            String className,
            JavaFileObject.Kind kind
        ) throws IOException {
            if (kind != JavaFileObject.Kind.CLASS) return null;
            if (location == StandardLocation.PLATFORM_CLASS_PATH) {
                return PLATFORM_CLASSES.find(className.replace('/', '.').replace('\\', '.'));
            }
            if (location == StandardLocation.CLASS_OUTPUT) return output.get(className);
            return null;
        }

        @Override
        public FileObject getFileForInput(
            JavaFileManager.Location location,
            String packageName,
            String relativeName
        ) throws IOException {
            if (location == StandardLocation.PLATFORM_CLASS_PATH && relativeName.endsWith(".class")) {
                String normalizedPackage = packageName.replace('/', '.').replace('\\', '.');
                String relativeClass = relativeName.substring(0, relativeName.length() - 6)
                    .replace('/', '.')
                    .replace('\\', '.');
                String className = normalizedPackage.isEmpty()
                    ? relativeClass
                    : normalizedPackage + "." + relativeClass;
                return PLATFORM_CLASSES.find(className);
            }
            return null;
        }

        @Override
        public JavaFileObject getJavaFileForOutput(
            JavaFileManager.Location location,
            String className,
            JavaFileObject.Kind kind,
            FileObject sibling
        ) {
            ClassFile classFile = new ClassFile(className);
            output.put(className, classFile);
            return classFile;
        }

        @Override
        public FileObject getFileForOutput(
            JavaFileManager.Location location,
            String packageName,
            String relativeName,
            FileObject sibling
        ) {
            String className = relativeName.endsWith(".class")
                ? relativeName.substring(0, relativeName.length() - 6)
                : relativeName;
            if (!packageName.isEmpty()) className = packageName + "." + className;
            return getJavaFileForOutput(location, className, JavaFileObject.Kind.CLASS, sibling);
        }

        @Override
        public ClassLoader getClassLoader(JavaFileManager.Location location) {
            return PrecapJavaRunner.class.getClassLoader();
        }

        @Override
        public String inferBinaryName(JavaFileManager.Location location, JavaFileObject file) {
            if (file instanceof PlatformClassFile) return ((PlatformClassFile) file).className;
            if (file instanceof ClassFile) return ((ClassFile) file).className;
            if (file instanceof SourceFile) {
                String path = file.getName();
                int slash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
                String name = slash < 0 ? path : path.substring(slash + 1);
                return name.endsWith(".java") ? name.substring(0, name.length() - 5) : name;
            }
            return null;
        }

        @Override
        public boolean isSameFile(FileObject first, FileObject second) {
            return first == second || first.toUri().equals(second.toUri());
        }

        @Override
        public boolean handleOption(String current, Iterator<String> remaining) {
            return false;
        }

        @Override
        public int isSupportedOption(String option) {
            return -1;
        }

        @Override
        public void flush() {}

        @Override
        public void close() {}

        Map<String, byte[]> classBytes() {
            Map<String, byte[]> classes = new LinkedHashMap<>();
            output.forEach((name, classFile) -> classes.put(name, classFile.bytes()));
            return Collections.unmodifiableMap(classes);
        }
    }

    private static final class MemoryClassLoader extends SecureClassLoader {
        private final Map<String, byte[]> classes;

        MemoryClassLoader(Map<String, byte[]> classes) {
            super(PrecapJavaRunner.class.getClassLoader());
            this.classes = classes;
        }

        @Override
        protected Class<?> findClass(String name) throws ClassNotFoundException {
            byte[] bytes = classes.get(name);
            if (bytes == null) throw new ClassNotFoundException(name);
            return defineClass(name, bytes, 0, bytes.length);
        }
    }

    private static final class OutputBudget {
        int remaining;
        boolean truncated;

        OutputBudget(int limit) {
            this.remaining = limit;
        }
    }

    private static final class LimitedOutputStream extends OutputStream {
        private final OutputBudget budget;
        private final ByteArrayOutputStream bytes = new ByteArrayOutputStream();

        LimitedOutputStream(OutputBudget budget) {
            this.budget = budget;
        }

        @Override
        public synchronized void write(int value) {
            synchronized (budget) {
                if (budget.remaining <= 0) {
                    budget.truncated = true;
                    return;
                }
                bytes.write(value);
                budget.remaining--;
            }
        }

        @Override
        public synchronized void write(byte[] data, int offset, int length) {
            synchronized (budget) {
                int accepted = Math.min(length, Math.max(0, budget.remaining));
                if (accepted > 0) {
                    bytes.write(data, offset, accepted);
                    budget.remaining -= accepted;
                }
                if (accepted < length) budget.truncated = true;
            }
        }

        String asString() {
            return new String(bytes.toByteArray(), StandardCharsets.UTF_8)
                .replace("\r\n", "\n")
                .replace('\r', '\n');
        }
    }
}
