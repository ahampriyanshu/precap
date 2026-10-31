# Browser C++20 runtime

This package compiles and runs the complete precap C++ curriculum on the device. It uses no execution service or host compiler. All runtime requests are same-origin static assets.

Call `runCpp({files, stage, onStatus, onOutput, signal})` from the page context. `files` is an object of virtual filename to source text, including `exercise.hpp`, `main.cpp`, and any lesson helper headers. The returned result has `phase`, `code`, `exitCode`, `stdout`, `stderr`, `diagnostics`, `termination`, and duration fields. `onStatus` receives `{phase,label}`; `onOutput` receives `(stream,text)`. `stopCpp()` stops the current invocation. A canceled invocation rejects with `AbortError`.

Compilation runs in a fresh worker using Clang 22 and LLD through Wasmer SDK 0.10.0. The compiler worker transfers the resulting WebAssembly and is terminated. Execution runs in a fresh hidden same-origin iframe using Wasmer SDK 0.19.1, which manages real program/thread workers. The frame is removed on completion, cancellation, or a parent-owned deadline. Cleanup touches only resources belonging to that invocation, so an old run cannot stop a newer run.

The explicit WASIX exception-enabled sysroot supplies libc++, C++ exception unwinding, pthreads, mutexes, condition variables, and TLS. The WASM-OJ compiler package's ordinary WASI profile alone is insufficient for these lessons. The old Wasmer Clang 16 package is not used.

## Hosting

Serve the entire directory without changing relative file locations. Documents need `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`, and a secure context. Same-origin static assets may use `Cross-Origin-Resource-Policy: same-origin`. A restrictive CSP must permit same-origin modules and frames, WebAssembly compilation (`wasm-unsafe-eval`), and workers from `self` and `blob:`. The runtime requires `SharedArrayBuffer`, WebAssembly threads/exception handling, and JavaScript Promise Integration (`WebAssembly.Suspending`). Verified in Chrome 156.0.8078.48.

Compiler and sysroot URLs include their SHA-256 query value and are checked against those digests before use. `asset-inventory.json` inventories every packaged file except itself. The SDK assets retain their original relative layout.

## Compiler completion

The older compilation SDK can leave a command-completion promise unsettled. Each stage therefore drains diagnostics and accepts only a WebAssembly-valid output with an unchanged SHA-256 digest for at least 100 ms, followed by another content/hash validation. Any compiler/linker error fails the build; absent or incomplete output times out. Each build uses a fresh virtual project and rejects non-source input paths, so an earlier artifact cannot satisfy a later build. The parent also owns a hard compiler-worker deadline.

## Validation

All 56 reference programs and 56 starters compiled in the browser. Both stages ran for each: 112 reference stages passed and 112 starter stages failed as expected. The app's instrumented harness and strict report reader produced 2,282 named-case reports without unexpected report errors. External requests were blocked during these checks. Real thread IDs, bounded worker execution, exception transport after joining, Unicode normalization, RAII unwinding, and shared DSA/LLD variants were exercised.

The unified adapter also passed the app's shared orchestration for the thread lesson, Unicode variant, and task scheduler. Invalid source produced source diagnostics. Infinite-loop timeout, Stop during execution, Stop during compilation, and immediate rerun were verified. Chrome's target inventory confirmed execution workers disappear after removing their owner frame; no frames or workers remained after rerun.

## Credits

A visible plain-text `C++ runtime powered by Wasmer` credit in the host UI is sufficient. A hyperlink is optional. The runtime SDK 0.19.1 uses Wasmer's Modified MIT license; its attribution clause applies above the thresholds in `licenses/Wasmer-SDK-0.19.1-Modified-MIT.txt`. Keeping this credit visible satisfies that display requirement as well as acknowledging the runtime.

Clang/LLVM, libc++, libc++abi, and libunwind are licensed under Apache-2.0 with LLVM exceptions; the WASIX libc includes additional MIT/BSD/CC0 components. Keep the accompanying notices in `licenses/` and `THIRD_PARTY_NOTICES.md` when redistributing.
