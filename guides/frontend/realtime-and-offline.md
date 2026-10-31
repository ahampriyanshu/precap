# Realtime, browser storage, and offline behavior

Request/response works when users can ask for a new view. Chat, live operations, collaborative editing, and unreliable connectivity require additional coordination. Persistent connections and local storage make those experiences possible, but introduce ordering, reconnection, versioning, and conflict policies.

“Realtime” does not mean every browser sees a globally simultaneous state. “Offline” does not mean every server operation can safely become a queued local write. Define the guarantee the product actually needs.

## Choose the simplest useful transport

Polling is straightforward and works through ordinary HTTP infrastructure, but creates repeated requests and a freshness interval. Long polling holds a request until new data or a timeout. Server-sent events provide a server-to-client text event stream. WebSockets provide bidirectional messages after an upgrade.

| Need | Plausible starting point | Additional obligations |
| --- | --- | --- |
| Infrequent status updates | Polling with backoff | Overlap prevention, visibility policy |
| Live notifications or generated text | SSE or streamed HTTP | Reconnect, event parsing, replay |
| Interactive bidirectional session | WebSocket | Message protocol, liveness, queues |
| Collaborative document edits | Transport plus a merge protocol | Ordering, identity, conflict semantics |

Choose based on message direction, latency target, proxy behavior, authentication constraints, and connection count. A WebSocket does not make data durable or establish business-level ordering across reconnects. An HTTP response chunk is not necessarily one logical event; streaming parsers must handle messages split across chunks.

## Reconnect from a durable cursor

A server event can carry an ID that the browser uses for replay. This browser SSE fragment relies on a server endpoint implementing the event contract:

```javascript
const events = new EventSource("/api/order-events");

events.addEventListener("order-updated", event => {
  const update = JSON.parse(event.data);
  applyOrderUpdate(update, event.lastEventId);
});

events.onerror = () => showConnectionState("reconnecting");

// Dispose with the owning feature.
function dispose() { events.close(); }
```

`applyOrderUpdate` must validate the payload and its version. EventSource can reconnect and send a last-event identifier, but only a server with a replay policy can recover missed data. If the cursor expired, the server should require a fresh snapshot rather than pretending no gap occurred.

Bound replay and client queues. If incoming events outpace rendering, coalesce safe replaceable updates or request a new snapshot. Never drop operations whose order matters merely to keep a chart smooth.

## Apply versions, not arrival order

An entity update with version 12 should not be overwritten by a delayed version 11. Version comparison belongs to the server's defined ordering domain; timestamps from different clocks are not automatically a reliable sequence.

```javascript
function acceptUpdate(current, incoming) {
  if (incoming.id !== current.id) throw new Error("Wrong entity");
  return incoming.version > current.version ? incoming : current;
}

const current = { id: "order-7", version: 12, status: "shipped" };
console.log(acceptUpdate(current,
  { id: "order-7", version: 11, status: "packed" }).status);
// shipped
```

This executable example assumes integer versions monotonically increasing per entity. Cross-entity transactions require a broader consistency contract. Deletion events need durable tombstone or snapshot semantics so an old update does not resurrect a removed item.

## Browser storage has scope and limits

Local storage is synchronous and suitable only for small amounts of simple data. IndexedDB supports asynchronous structured storage and transactions, making it more appropriate for substantial local records. Storage is origin-scoped, quota-limited, and subject to eviction and user clearing.

Persisted data needs a schema version, migration or reset policy, identity scope, and retention limit. A browser refresh must not load another user's draft after logout. A failed quota write should produce a recoverable state rather than silently claiming the work is safe.

Use the BroadcastChannel API or another appropriate mechanism to notify same-origin tabs of relevant changes, but treat notifications as hints and read authoritative current state. A tab can suspend or close at any moment. Cross-tab leader election is another distributed coordination problem, not a reliable property of “the first tab.”

## Service workers add a separate lifecycle

A service worker can intercept eligible requests and coordinate cached responses outside the page's normal lifecycle. It requires a secure context, with development exceptions such as localhost. Its registration scope controls which clients it can affect.

Cache public immutable assets differently from private API responses. A generic cache-first handler for every GET can retain account data and stale application HTML. Version caches, remove obsolete data deliberately, and define the fallback when both network and cache fail.

A newly installed worker may wait while older controlled pages remain open. Forcing immediate activation can mix new worker assumptions with old page code. Treat activation, client code, storage schema, and server compatibility as one release problem. Offline support increases the duration for which older clients may remain active.

## Offline writes need a business policy

Queueing a local action requires an operation ID, payload schema, creation context, retry policy, and visible status. Do not blindly replay a purchase, inventory reservation, or privileged action hours later under changed conditions.

![An offline draft is persisted as a pending operation, then replayed with the same identity; acceptance reconciles server state while a conflict keeps the draft for resolution.](/diagrams/frontend-offline-sync.svg)

```text
Local edit
  → persist operation K and draft atomically
  → display "pending sync"
  → reconnect and revalidate session/permissions
  → submit K against known revision
  → accepted: record server state and remove K
  → conflict: retain draft and ask for resolution
```

If the response is lost after acceptance, replay the same operation identity to obtain the existing outcome. The server must enforce deduplication. A retry limit or expired operation should remain visible to the user; “offline saved” and “server accepted” are different promises.

Collaborative text editing may need operational transformation or a CRDT to merge concurrent edits. Those algorithms solve a defined data-model problem, not authorization, document retention, transport reliability, or every semantic conflict. A spreadsheet formula or financial approval can need application-level constraints beyond text convergence.

## Exercise reconnect and upgrade failures

Disconnect after sending a write but before its acknowledgement. Resume after the replay window expires. Open two tabs, switch accounts, fill storage, and upgrade the application while one tab stays offline.

The design is complete only when each state has an honest user-visible meaning and a safe recovery path. Transport selection is the beginning of that design.
