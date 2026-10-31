# TypeScript, modules, and the build graph

Scripts originally shared globals and depended on document ordering. Modules made imports and exports explicit; tooling then transformed module graphs for browsers, package ecosystems, and multiple deployment environments. TypeScript adds static checks to that authoring process.

These tools solve different problems. A type checker establishes relationships the compiler can see. A bundler transforms and delivers dependencies. Neither validates an untrusted response or guarantees a small production bundle.

## Model domain states instead of boolean combinations

Independent `loading`, `error`, and `data` flags allow contradictory combinations. A discriminated union makes the valid states explicit:

```typescript
type Order = { id: string; totalMinor: number; currency: string };
type OrderState =
  | { kind: "idle" }
  | { kind: "loading"; requestedId: string }
  | { kind: "ready"; order: Order }
  | { kind: "failed"; message: string };

function heading(state: OrderState): string {
  switch (state.kind) {
    case "idle": return "Choose an order";
    case "loading": return `Loading ${state.requestedId}`;
    case "ready": return `Order ${state.order.id}`;
    case "failed": return state.message;
    default: {
      const unreachable: never = state;
      return unreachable;
    }
  }
}
```

Exhaustiveness makes a new state visible at its consumers. The model still needs correct transitions: a stale request must not replace a newer result merely because both values satisfy the union.

Prefer precise types at boundaries and inference within straightforward functions. A generic abstraction with many type parameters is useful only if it expresses an actual relationship. `any` disables checks along its propagation path; `unknown` requires a check before use.

## External data needs runtime validation

Type annotations are erased. This executable TypeScript function validates a small wire representation rather than casting it:

```typescript
type Amount = { minor: number; currency: "USD" | "EUR" };

function parseAmount(value: unknown): Amount {
  if (typeof value !== "object" || value === null) {
    throw new Error("Expected an amount object");
  }
  const object = value as Record<string, unknown>;
  if (!Number.isSafeInteger(object.minor) ||
      (object.currency !== "USD" && object.currency !== "EUR")) {
    throw new Error("Invalid amount");
  }
  return { minor: object.minor as number, currency: object.currency };
}
```

The safe-integer check rules out fractional amounts, infinity, and unsafe numeric precision. Whether negative values are valid depends on the operation: refunds and balances differ from a quantity. A schema library can generate validation and useful error paths for larger contracts, but server authorization and business validation remain separate.

Generated API types reduce drift if schemas and releases are managed together. They cannot establish that the server deployed the same schema or that a cache returned a current representation. Treat decoding errors as observable compatibility failures, with sanitized diagnostics.

## The module graph determines shipped code

Static imports make dependencies visible to build tools. A module's side effects matter: importing a utility that imports a large editor can make that editor part of the initial graph. Tree shaking removes code only when the tool can prove removal is safe under the module and package metadata.

```javascript
// Load an infrequently used capability at the interaction boundary.
let editorModule;
export async function openEditor(container, documentId) {
  editorModule ??= import("./editor.js");
  const { mountEditor } = await editorModule;
  return mountEditor(container, documentId);
}
```

This module fragment assumes `mountEditor` owns mounting and disposal. Handle failed imports and a user navigating away before the import resolves. Splitting creates more requests and runtime coordination; a tiny fragment split into many chunks can cost more than it saves.

Choose stable route or feature boundaries, inspect production output, and evaluate compressed transfer and parse/evaluation cost. Development module counts are not a production payload measurement. A package's advertised size may exclude its dependencies and execution cost.

## Browser and server graphs are separate trust domains

A universal module that imports a database client can accidentally pull privileged dependencies into an inappropriate build. Use clear entry points, server-only boundaries where supported, and narrow data transfer objects. An environment variable replaced into a browser bundle is public regardless of its original filename.

Shared code should contain genuinely portable logic, such as formatting or validated domain calculations, rather than every server helper. Browser APIs such as `window` are unavailable during server execution. Branching at module import time can still break server rendering before a component has mounted.

Keep CommonJS/ES module interoperability and package export conditions explicit. A package may expose different implementations for browser, node, development, and production. An upgrade can change which path the bundler selects even if the import statement stays the same.

## Reproducibility extends beyond a lockfile

A lockfile records resolved dependencies; reproducible output also depends on the runtime version, build inputs, configuration, generated artifacts, and environment substitutions. Separate type checking, linting, tests, and production compilation so a fast development server does not hide skipped checks.

Content-hashed asset names let caches distinguish releases. Retain older referenced chunks while old HTML and tabs remain active. Publishing new HTML before all of its assets arrive can create a broken release even when every file eventually exists.

Source maps improve diagnosis but can reveal source content. Decide where maps are hosted and who may access them. Uploading maps to an error system requires matching the exact artifact and release identifier. A stack trace mapped against another build can confidently point to the wrong source.

## Review tooling through observable outcomes

When evaluating a build change, compare cold and incremental build time, initial and route-level payloads, runtime errors, and cache behavior. A faster compiler can improve developer iteration without changing user performance; a smaller bundle can still execute expensive initialization.

Keep package boundaries aligned with ownership and release constraints. A monorepo does not require a single deployable bundle, and splitting repositories does not create independent runtime contracts. The build graph should make those decisions visible.
