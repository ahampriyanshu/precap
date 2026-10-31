# Components, state ownership, and React scheduling

As interfaces became interactive, manual DOM updates created a consistency problem: every action had to remember which pieces of the screen depended on the changed data. Declarative components express the view as a function of inputs and state, leaving the rendering system to reconcile the result.

That reduces bookkeeping but does not decide where state belongs. Component design is principally a question of identity, ownership, transitions, and effect lifetimes; JSX syntax is the small part.

## Put each fact under one owner

Distinguish local interaction state, shareable URL state, authoritative server records, and derived values. An open menu can remain local. A search query often belongs in the URL. An account balance belongs to the server even while a client cache displays it. A filtered row count can be derived from the current rows and filter.

Duplicating a derived value in state creates synchronization work. This React integration derives it during rendering instead:

```tsx
import { useState } from "react";

type Row = { id: string; title: string };

export function SearchableList({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase();
  const visible = rows.filter(row =>
    row.title.toLocaleLowerCase().includes(normalized));

  return (
    <section aria-label="Records">
      <label>Search <input value={query}
        onChange={event => setQuery(event.target.value)} /></label>
      <p>{visible.length} records</p>
      <ul>{visible.map(row => <li key={row.id}>{row.title}</li>)}</ul>
    </section>
  );
}
```

For a large dataset, move filtering to an appropriate index, server query, or worker before assuming memoization fixes the cost. Local filtering of one page of a paginated server response must not be presented as searching the entire dataset.

## Identity determines whether state survives

React associates state with component identity in the rendered tree. Stable keys help match siblings across insertions and moves. Array indices can associate an input's state with a different record after reordering; random keys recreate components and lose state on each render.

A key can also intentionally reset state when the editing subject changes:

```tsx
// A new identity discards the previous record's local draft.
<RecordEditor key={selectedRecord.id} record={selectedRecord} />
```

That reset needs a product policy for unsaved work. Reusing the component instead requires explicit draft reconciliation. Component identity cannot decide whether a server update should overwrite local edits.

Keep transient state near its users, lift it only to the nearest necessary owner, and use context for genuinely shared dependencies. A single context containing every changing value broadens update propagation and obscures responsibilities. Separate high-frequency interaction state from stable services and configuration.

## Model transitions when booleans stop being enough

A reducer can make a multi-step interaction auditable. Here is a pure TypeScript state transition core:

```typescript
type State =
  | { kind: "editing"; draft: string }
  | { kind: "saving"; draft: string; requestId: number }
  | { kind: "saved"; value: string }
  | { kind: "failed"; draft: string; message: string };
type Action =
  | { type: "submit"; requestId: number }
  | { type: "accepted"; requestId: number; value: string };

function reduce(state: State, action: Action): State {
  if (action.type === "submit" &&
      (state.kind === "editing" || state.kind === "failed")) {
    return { kind: "saving", draft: state.draft,
             requestId: action.requestId };
  }
  if (action.type === "accepted" && state.kind === "saving" &&
      action.requestId === state.requestId) {
    return { kind: "saved", value: action.value };
  }
  return state;
}
```

The excerpt shows submit/acceptance transitions; editing, rejection, cancellation, and conflict actions belong in a complete editor. Keeping effects outside the reducer makes retries and interleavings testable. For workflows with many states or parallel regions, an explicit statechart may express invariants better than another collection of flags.

## Rendering computes; committing changes the host

React rendering calls components to compute a candidate tree. The commit applies accepted changes to the DOM and coordinates effects. A render can be restarted or abandoned, so it must remain pure: do not send a request, mutate an external collection, or generate a new persistent identifier as a render side effect.

Effects synchronize with external systems after a commit. A subscription effect needs a matching cleanup and correct dependencies. Updating a derived display value through an effect creates an unnecessary extra render and can temporarily show inconsistent state. Event-specific work usually belongs in the event handler; external synchronization belongs in an effect.

Development checks may deliberately repeat setup and cleanup to expose unsafe behavior. Make lifecycle operations reversible and idempotent rather than relying on a single mount happening forever.

## Scheduling prioritizes rendering; it does not parallelize arbitrary code

React can treat some updates as less urgent so input-related updates get priority. In this TSX fragment, the input remains immediate while rendering results may lag:

```tsx
import { memo, useDeferredValue, useState } from "react";

type Row = { id: string; name: string };
const Results = memo(function Results({ rows, query }: { rows: Row[]; query: string }) {
  const matching = rows.filter(row => row.name.toLowerCase().includes(query.toLowerCase()));
  return <ul>{matching.map(row => <li key={row.id}>{row.name}</li>)}</ul>;
});

export function Search({ rows }: { rows: Row[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  return <>
    <label>Search <input value={query}
      onChange={event => setQuery(event.target.value)} /></label>
    <div aria-busy={query !== deferredQuery}>
      <Results rows={rows} query={deferredQuery} />
    </div>
  </>;
}
```

The memo boundary is required here so an urgent input render can skip the unchanged results subtree while its deferred query still has the old value. Keep the `rows` reference stable when its data has not changed. Deferral does not debounce requests or move filtering onto another thread; React cannot preempt the middle of an arbitrary long JavaScript function. Measure the boundary and use a worker or a different algorithm when one computation itself blocks for too long.

## External stores and concurrent consistency

A store outside React needs a subscription contract that provides coherent snapshots. Hand-written subscriptions can miss updates between reading a value and attaching a listener. React's external-store integration exists to coordinate those snapshots with rendering; state libraries should use a compatible mechanism.

Reducers, context, query caches, and external stores solve different ownership problems. Choose the least machinery that keeps facts consistent. Review a state architecture by tracing one action through its owner, transition, external effect, rejection path, and rendered result. If that path crosses five stores and three mirrored values, the abstraction is already charging interest.
