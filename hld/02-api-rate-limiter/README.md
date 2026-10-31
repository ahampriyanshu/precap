# API Rate Limiter

## The problem

Design a limiter that enforces one client's quota across every API gateway. A request allowed through gateway A must consume the same budget observed by gateway B. The limiter also needs a defined response when its shared state is unreachable; otherwise a dependency outage silently changes the product's traffic policy.

Assume a hypothetical API receives 50,000 requests per second and gives each authenticated client 100 requests per minute. A shared decision on every request means 50,000 state operations per second before retries. If one million clients are active in a minute and each counter record costs an estimated 100 bytes, the active counters occupy roughly 100 MB before replication and store overhead. Traffic volume, active identities, and hot-client concentration drive different capacity limits.

## Naive approach

A gateway-local fixed-window counter avoids a remote lookup, but gives every gateway an independent allowance. Moving the counter to shared storage still leaves a race if admission is read-then-write:

```pseudocode
gateway A: read(client, window) -> 99
gateway B: read(client, window) -> 99
gateway A: 99 < 100, admit, write 100
gateway B: 99 < 100, admit, write 100
stored count -> 100
actual admissions -> 101
```

The store lost an increment and the API admitted too much work. Sticky routing only hides the problem until failover or rebalancing. Derive client identity from authenticated credentials, not an arbitrary caller-supplied header.

## Where the naive approach breaks

Four gateways with separate counters can grant 400 requests under an intended allowance of 100. A shared store fixes ownership only when the whole decision is atomic.

Outages also change policy. If every timeout defaults to allow, the limiter’s failure can overload expensive downstream jobs. Denying everything protects capacity while making the quota dependency an API availability requirement. Choose and expose the behavior per endpoint.

## A better design

Authenticate at the gateway and derive a quota key `(tenant, route_class, window_start)`. A shared quota service owns the atomic admission decision.

```text
Client -> Gateway -> Quota service -> Counter store
             | allowed
             v
         Application
```

For a fixed window, one Redis Lua script can check, increment, and install expiry without another command interleaving:

```lua
local count = tonumber(redis.call('GET', KEYS[1]) or '0')
local limit = tonumber(ARGV[1])
if count >= limit then return 0 end
local updated = redis.call('INCR', KEYS[1])
if updated == 1 then
    redis.call('PEXPIRE', KEYS[1], ARGV[2])
end
return 1
```

Return 1 means admitted; 0 means denied without increment. The quota service supplies a validated positive limit and milliseconds remaining until its trusted window boundary, and uses a separate key per window. Expiry reclaims the old counter; it does not define client identity or choose the clock. The script executes atomically on the serving instance; replication, persistence, and failover require separate guarantees. Keep the script bounded; it blocks other work while running.

The RPC can return decision, remaining allowance, policy version, and reset time. Denials produce HTTP 429 and retry guidance. All gateways share the same window definition. Never accept a caller’s timestamp as quota authority.

An RPC timeout can mean admission committed but the reply was lost. Retrying consumes another allowance unless the service deduplicates decision requests. Conservative double counting differs from overspending. For costly job submission, fail closed with unavailable when no decision can be made. A cheap public read may explicitly fail open if downstream capacity permits; count bypasses separately from verified admissions.

A fixed window permits 100 requests immediately before reset and 100 immediately after. Sliding windows or token buckets change that policy at additional state cost. Local token leases reduce remote operations but reserve budget ahead of use and complicate failover. Sharding distributes ordinary clients; a single abusive key can still be hot.

## Real-world usage

Shared admission is useful for API plans, login attempts, and expensive exports. Track allowed, limited, unavailable, and bypassed outcomes separately, along with decision latency, store errors, and per-key concentration. Bound identity cardinality, reject unauthenticated key churn, and protect the limiter itself with request deadlines. A successful quota check is admission control, not authentication or a complete denial-of-service defense.

## Practice

### Design brief

Design shared API admission for 50,000 requests per second and one million active clients per minute. Each authenticated client receives 100 requests per minute across all gateways. Begin with fixed windows, state the allowed boundary burst, and choose a decision latency budget. Define separate outage policies for expensive job submission and cheap public reads.

### Draw and explain

In Excalidraw, label gateways, policy ownership, quota state, and the protected application boundary. Draw allowed, limited, and unavailable request paths, including where identity and trusted time originate. Explain the atomic admission decision and the meaning of remaining-budget and retry guidance. Estimate active-state memory and state operations per second; show where adding gateways increases load elsewhere.

### Stress the design

Two gateways receive a client's final permitted request concurrently. Walk through the observed decisions. Then let the quota dependency time out after possibly recording an admission. Explain whether a retry spends another token and how the client distinguishes unavailable service from exhausted quota. Show how the expensive endpoint remains protected during this uncertainty.

### Review your design

Compare strict shared decisions with local token leases: quantify the availability, overspending, and unused-capacity implications. Explain when fixed-window bursts justify a different algorithm. Check policy rollout, clock skew, identity cardinality, and one abusive hot key. Choose signals for bypassed decisions, limiter latency, throttling, and downstream saturation.
