# Rebuild the Java browser runtime

Run this from the project root:

```sh
node scripts/browser-runtime-java/build.mjs
```

Requirements: Node.js with `fetch`, Python 3, the project's Playwright package,
and its installed Chromium browser. The helper Java source is compiled inside
Chromium using the pinned CheerpJ 4.3 browser JVM and ECJ 3.42.0. This recipe does
not invoke a local `java` or `javac` command. Python only assembles ZIP entries.

The script verifies both downloads against `build-inputs.json`, runs an isolated
HTTP server on a random localhost port, compiles `PrecapJavaRunner.java` in a
browser worker, packages the compiler/API/helper JAR, and updates the worker
checksum, `manifest.json`, and the adapter's SHA-256 query parameter.

```sh
node scripts/browser-runtime-java/build.mjs --cache /absolute/cache/directory
node scripts/browser-runtime-java/build.mjs --output /absolute/output/directory
```

The default output is `public/runtimes/java`. The default download cache uses
the operating system's temporary directory. `PRECAP_JAVA_CHROMIUM_EXECUTABLE`
can select an existing Chromium executable; `PRECAP_JAVA_PYTHON` can select the
Python executable. Neither variable is required with normal project tooling.

The packaging recipe sorts entries, fixes ZIP timestamps, and uses the same
compression settings. With the same browser-emitted class bytes and Python/zlib
toolchain, a repeated package operation produces the same asset hash. The
manifest records the helper source hash and all pinned input identities.

The bootstrap JAR is only a build input. Its original helper classes are omitted
from the output. The output contains unchanged official ECJ compiler classes,
unchanged Java 17 API signatures/index from the verified bootstrap, and this
project's browser-built helper classes. No exercise solutions are included in
these scripts or runtime assets.

The Eclipse compiler's original JAR signature files are removed because entries
are added to the bundle. The original compiler class bytes are preserved.
Original license files and copyright declarations are distributed alongside
the output in `public/runtimes/java/licenses`, with their source revisions in
`THIRD_PARTY_NOTICES.txt` and `manifest.json`.

CheerpJ Core remains on its official CDN. It is not downloaded into the output
directory or self-hosted. Keep the application's CheerpJ attribution and use
its Community License only within the project's confirmed eligible scope.

## Adapter contract

```js
import { runJava, stopJava } from "/runtimes/java/adapter.mjs";

const result = await runJava({
  files: [{ path: "Main.java", content: source }],
  stage: "final",
  onStatus({ phase, label }) {},
  onOutput(stream, text) {},
  signal: controller.signal,
});
```

`files` also accepts an object mapping filenames to source strings. It should
include the original test harness and the learner's `Exercise.java`. The default
main arguments are `--stage prototype` or `--stage final`. Optional `args`
overrides those arguments for isolated probes.

Phases are `initializing`, `compiling`, and `running`; callers can set a separate
deadline for each. Loading/service failures reject. Compiler errors resolve with
`phase: 'compile'` and a nonzero `exitCode`; program failures resolve with
`phase: 'runtime'` and a nonzero `exitCode`. `System.exit` codes are preserved.
Output is buffered until execution returns and is bounded to 1 MiB combined.
The result includes `stdout`, `error`, `warning`, `phase`, `restartRuntime`,
`duration`, and `exitCode`.

Abort or `stopJava()` terminates the worker and rejects with `AbortError`.
A later invocation creates a fresh worker. An outer runner may always call
`stopJava()` in `finally` to discard program state after each attempt.

The JAR is fetched in full, checksum verified, and mounted in the browser's
transient `/str` filesystem. The application server does not need HTTP Range
support. All user source, compiled classes and program output stay in the
browser worker. The runtime has been verified under COOP `same-origin`, COEP
`require-corp`, and CORP `same-origin`.

Source strings are also mounted transiently as `/str/<filename>` before ECJ
compilation. ECJ only attaches diagnostic file objects when their paths exist;
matching `file:///str/<filename>` source-unit URIs preserve the original
filename, line and column without adding or rewriting source lines.
ECJ emits source and line debug attributes (`-g:lines,source`); local-variable
debug tables are omitted. Compiler diagnostics preserve filenames and source
coordinates. In the tested CheerpJ 4.3 runtime, exception frames retain class
and method names but display `Unknown Source`, even with these debug attributes.
The adapter preserves the runtime's trace without guessing source locations.
