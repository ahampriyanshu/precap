# Streaming, Server Components, and useful boundaries

Whole-page rendering makes fast content wait for the slowest dependency. Streaming allows useful regions to arrive earlier. Server Components address a different cost: shipping and executing client JavaScript for components that only need server data and produce presentation.

These mechanisms are valuable when boundaries match user-visible tasks and data dependencies. Splitting every component does not automatically improve latency, and moving code to the server does not make its data safe to expose.

## Start independent dependencies before awaiting them

Suppose an account page needs a profile, a summary, and a slow recommendation service. Awaiting them sequentially creates an avoidable waterfall. Independent requests can start together; dependent requests must still wait for their inputs.

This server integration fragment starts two independent operations and waits only where their results are consumed:

```tsx
import { Suspense } from "react";

export async function AccountPage({ accountId }: { accountId: string }) {
  const summaryPromise = loadSummary(accountId);
  const recommendationsPromise = loadRecommendations(accountId);
  // Observe an early rejection even if the summary fails first.
  recommendationsPromise.catch(() => {});
  const summary = await summaryPromise;

  return <main>
    <h1>Account overview</h1>
    <Summary value={summary} />
    <Suspense fallback={<p>Loading suggestions…</p>}>
      <Recommendations valuePromise={recommendationsPromise} />
    </Suspense>
  </main>;
}

async function Recommendations({ valuePromise }) {
  const values = await valuePromise;
  return <RecommendationList values={values} />;
}
```

The excerpt requires a server framework that supports async Server Components and integrates the data promises; the loaders and display components are application-owned. The rejection observer prevents an early recommendation failure from becoming an unhandled rejection; the child still awaits the original promise and throws to the framework's error handling. Prefer a framework's supported data/error facilities in a real application.

The summary is intentionally necessary before this shell renders. If its latency is also high, a different boundary may be appropriate. A skeleton without meaningful content is not useful merely because bytes arrived early.

## A Suspense boundary is not an error or fetch wrapper

Suspense coordinates rendering when a supported dependency suspends. Fetching in an ordinary client effect does not automatically activate a nearby Suspense boundary. Framework data integration, lazy component loading, and supported promise-reading APIs have specific contracts.

Error boundaries handle a different class of failure. A fallback should match the region: a failed recommendation panel should not necessarily remove the account balance. Timeouts and transport failures still need application policy. An infinite fallback is not a recovery design.

Group regions that should appear together. Splitting a heading from its associated controls across many boundaries can create a fragmented and confusing page. Reserve space where possible to avoid large layout shifts, and consider how focus and announcements behave as content arrives.

## Streaming changes response timing

Once HTTP headers and initial body bytes have been sent, the server cannot later change that response's status to a different code. Resolve access control, redirects, and essential route existence before streaming when those need authoritative HTTP semantics.

```text
Request arrives
  → authenticate and authorize essential route
  → resolve status-critical resource existence
  → send shell and headers
  → stream independent completed regions
  → deliver client code for interactive regions
```

A reverse proxy or CDN may buffer the response, eliminating the expected progressive delivery. Compression settings, small chunk sizes, and browser behavior also affect when content becomes visible. Validate the deployed path with real timing rather than only a local development server.

Streaming can reduce time to useful content without reducing total work. It can also hold server resources and connections open longer. Bound expensive dependencies and decide what happens when the client disconnects.

## Server Components describe an execution boundary

In a supporting React framework, Server Components execute on the server or during generation. Their component implementation is not shipped as browser component code. Client Components supply state, event handlers, and browser capabilities; they may still contribute prerendered HTML for the first load.

![Server data and presentation remain in the server graph; serialized public data and a small interactive control cross into the client graph, which hydrates in the browser.](/diagrams/frontend-server-boundary.svg)

The `use client` directive marks a client module boundary, including its imported client dependencies. Placing it high in the graph can pull more code into the browser than expected. A server-rendered parent can compose an interactive leaf without making every surrounding data loader client code.

```tsx
// FollowButton.tsx — client module
"use client";
import { useState } from "react";

export function FollowButton({ initialFollowing, onChange }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setPending(true);
    setError("");
    try {
      const accepted = await onChange(!following);
      setFollowing(accepted.following);
    } catch {
      setError("Could not update. Try again.");
    } finally {
      setPending(false);
    }
  }

  return <>
    <button type="button" disabled={pending} aria-pressed={following}
      onClick={toggle}>{following ? "Following" : "Follow"}</button>
    <p role="status">{error}</p>
  </>;
}
```

This client integration expects `onChange` to be an ordinary client callback or a framework-supported server function reference, not an arbitrary function serialized from the server. The mutation must validate identity, authorization, and accepted state server-side. A production implementation should handle prop changes or resource identity changes deliberately rather than treating initial props as permanently current.

## Serialization is an API surface

Passing an entire database entity to a Client Component can expose fields the visual component never renders. Send the minimum authorized representation. Supported serialized types depend on the protocol and framework; ordinary class instances and arbitrary closures should not be treated as portable data.

Server-side code location does not exempt a mutation from authorization. A server function can be invoked through its transport; validate every invocation and defend against forged requests. Keep secrets in the server graph and audit actual response payloads, including serialized component data and error output.

Cache scope is especially important. A cached server function keyed only by record ID can leak data if permissions or tenant identity change its result. Distinguish reusable public computation from request-specific authorization and representation.

## Evaluate the boundary with a concrete route

For a public article with an authenticated save button, article loading and syntax rendering can remain server-side. The button receives only its public article ID and authorized initial save state. A slow related-content region can stream independently. The route still needs a coherent not-found status, cache policy, and client navigation behavior.

Inspect browser JavaScript, serialized payload size, time to meaningful content, hydration work, and error isolation before and after. A smaller component bundle accompanied by a huge serialized payload may merely move the cost. Keep the boundary where it reduces a measured cost without weakening correctness.
