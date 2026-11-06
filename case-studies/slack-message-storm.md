# The Slack message storm incident

## Context

In 2015, Slack was growing rapidly — workspace sizes were increasing and the number of concurrent connections to their gateway servers was climbing. The gateway tier maintained persistent WebSocket connections with every connected client. The gateway also managed presence: tracking which users were online, in what workspace, and broadcasting presence changes to workspace members. The presence system worked correctly under steady-state load. It broke catastrophically under restart conditions, revealing a feedback loop that the team hadn't anticipated because it only manifested at scale.

## The problem

The core failure was a thundering herd triggered by server restarts, made worse by an O(N²) presence subscription model.

**The initial condition:** When a Slack gateway server restarted, all clients connected to it lost their WebSocket connections simultaneously. Clients detected the disconnect and immediately attempted to reconnect — by default without any backoff.

**The reconnect sequence:** On reconnect, each client performed the following:
1. Re-authenticated.
2. Subscribed to channels for the workspace.
3. Fetched current presence state for all workspace members (to show who is online in the sidebar).

Step 3 is the problem. For a workspace with N members, every reconnecting client sent N presence subscription requests. With K clients reconnecting simultaneously, that's K × N presence requests hitting the backend in a burst — O(K × N) traffic from a single gateway restart.

**The feedback amplification:** Presence subscription state changes triggered presence update events. When a client subscribed to presence for a workspace member, the presence system noted the new subscription and in some cases emitted a presence event to notify the subscribing client and others of the updated subscription graph. These events were processed by other clients which were themselves in the process of reconnecting, triggering additional presence fetches.

The result was a feedback loop: reconnect → presence fetch → presence event → more reconnect processing → more presence fetches. Under the reconnect burst, the presence backend saturated. As it slowed down, clients timed out their presence requests and retried, adding more load. Gateway servers themselves became overloaded from the connection and event processing volume, causing them to restart — which added more disconnected clients to the pool of reconnecting clients.

The incident cascaded from a single gateway restart into a prolonged degraded state affecting all of Slack.

## What they tried first

The immediate mitigation was to restart gateway servers manually in a controlled sequence to drain the reconnecting client pool gradually rather than all at once. This helped break the cascade but required manual coordination during the incident, which was slow and error-prone.

The team also temporarily disabled presence updates globally to stop the feedback loop — this stabilized the system at the cost of showing stale presence data to all users. It was an effective but blunt intervention. Disabling a core feature to prevent the infrastructure from collapsing is a circuit breaker in the operational sense, not a fix.

They also looked at rate-limiting presence requests at the gateway tier, but implementing this mid-incident on running systems without introducing new failure modes was not practical in the timeframe.

## The fix

The fix addressed the problem at multiple layers simultaneously.

**Exponential backoff with jitter on client reconnect:** The simplest and highest-impact change. Instead of all clients reconnecting immediately after a disconnect, clients waited a random interval sampled from an exponentially growing backoff window. Jitter (randomized delay) spreads the reconnect burst over time, converting a simultaneous thundering herd into a gradual trickle. The formula: `sleep(min(cap, base * 2^attempt) * random(0.5, 1.0))`. This change alone dramatically reduced peak reconnect load.

**Rate-limiting presence subscriptions at the gateway:** The gateway tier was modified to accept presence subscription requests at a bounded rate per connection and per workspace. Excess requests were queued server-side rather than immediately forwarded to the presence backend. This decoupled the reconnect burst from the presence backend load spike.

**Batching presence events:** Instead of emitting a presence event per subscription change, the presence system was modified to batch events within a short time window (e.g., 500ms) and emit one aggregate event per batch. This reduced the event fan-out from O(reconnects) to O(reconnects / batch_window_size).

**Decoupling presence sync from channel subscription:** The reconnect sequence was refactored so that channel subscription (needed to receive new messages) happened first and immediately, while presence sync was deferred — triggered lazily on first sidebar render or first channel open rather than on connect. This separated the high-priority operation (message delivery) from the expensive operation (presence sync) and allowed presence to be rate-limited without delaying message delivery.

**Eventual presence model:** The team moved to a lazy presence sync model where presence state is refreshed on demand (when a user opens a channel or the sidebar) rather than maintained as a fully consistent subscription at connect time. This reduced steady-state presence backend load and made the reconnect sequence cheaper by default.

## What it cost

Presence data became eventually consistent rather than immediately consistent. Users might briefly see a contact shown as offline who was actually online, or vice versa, until their local presence state refreshed. For most use cases this was acceptable — real-time presence accuracy within a few seconds is sufficient for a chat product.

The lazy sync model also meant that the initial channel load could include a brief moment before presence indicators populated. The team added placeholder states in the UI to handle this gracefully. Engineering time for the full fix across client and backend was several weeks.

## Takeaways

- **Thundering herd problems scale with system size and are invisible until they happen**: The O(N²) presence load only became catastrophic when N (workspace size) and K (concurrent reconnecting clients) were both large. Testing at smaller scale didn't surface the feedback loop.
- **Client reconnect logic without backoff and jitter converts every server restart into a self-inflicted DDoS**: This is a well-known failure mode; the fix (exponential backoff + jitter) is standard and should be in every client by default.
- **Decoupling operations by priority prevents a heavyweight operation from blocking a lightweight one**: Separating presence sync from channel subscription meant message delivery stayed fast under reconnect load.
- **Batching and rate-limiting at the gateway tier absorb burst traffic without requiring backend changes**: Gateway-level controls are faster to deploy and easier to tune than changes deep in the stack.
- **"Eventual" is often good enough — and far more resilient**: Presence data accurate to within a few seconds is indistinguishable from real-time for users; the strict consistency model cost more than it delivered.

## Interview angle

This case maps to two interview contexts: distributed systems design questions about presence systems, and reliability questions about handling reconnect storms.

*"Design a presence system for a messaging app"* — the key questions are: how do you track who is online, how do you propagate presence changes, and how do you handle client reconnects? A strong answer includes a discussion of fanout cost (presence changes need to reach all workspace members), debouncing/batching, and what happens when large numbers of clients disconnect simultaneously.

*"Your service just restarted and all clients are reconnecting at once. What happens and how do you prevent it?"* — the expected answer is exponential backoff with jitter on the client, rate-limiting on the server, and queuing/batching to absorb bursts. The common mistake is to only address one side (server-side rate-limiting) without noting that client-side backoff is what actually prevents the burst from forming.

The O(K × N) complexity is a good warm-up for discussing why global presence subscriptions don't scale — leading naturally into partitioned or gossip-based presence architectures.

---
*Source: Slack Engineering Blog, 2015. Post-incident analysis on the message storm incident.*
