# Optional Go runtime build tooling

This is a separate npm project for rebuilding the vendored browser Go runtime.
The application's normal installation and build use its existing Node.js
requirement and do not install this SDK. Rebuilding these assets requires
Node.js **24.18 or newer in the 24.x release line**, as required by the SDK.

From this directory:

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run build
```

The default output is `public/runtimes/go/` in the application. To review a
build in a separate folder before copying it:

```sh
npm run build -- /absolute/path/to/temporary/go-runtime
```

The lockfile pins `@wasm-oj/browser` 0.2.5, `@wasm-oj/toolchain-go` 0.2.0,
and esbuild 0.25.12, including all package integrity values. The Go toolchain
contains Go 1.26.5 and its matching WASI standard library.

`prepare-go-assets.mjs` bundles `run-go.js`, copies the SDK workers and Wasm
files beside the adapter, copies the Go compiler and standard-library assets,
verifies every pinned Go asset's byte count and SHA-256, and preserves the
upstream LICENSE files, third-party notices, and dependency license reports.
The generated `asset-inventory.json` records the output file identities.

Serve the output at `/runtimes/go/`. Keep `adapter.mjs` beside its `assets/`
and `toolchains/` directories so the SDK's relative worker URLs resolve.
Serve `.wasm` as `application/wasm`; do not apply HTTP `Content-Encoding:
gzip` to stored `.gz.bin` assets because the worker decompresses them.
The document must receive COOP `same-origin`, COEP `require-corp`, and CORP
`same-origin`, and CSP must permit same-origin and blob workers and Wasm.

The published assets compile and run Go in browser workers. They do not use a
compiler service or send learner source to an external host. This tooling
folder contains runtime source only; private exercise solutions must never
be added to its output.
