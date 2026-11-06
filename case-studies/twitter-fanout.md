# From fanout-on-write to hybrid delivery

## Context

Twitter's core product promise is a real-time feed of tweets from accounts you follow. Delivering that feed requires either pre-computing it (fanout-on-write) or assembling it at read time (fanout-on-read). Twitter chose fanout-on-write early on: when a user posts, the tweet is pushed into every follower's timeline cache immediately. This works at modest follower counts. By 2013, Twitter had accounts with tens of millions of followers, and the write-time fanout model had become the system's most expensive and fragile operation.

## The problem

Fanout-on-write, also called push-on-write, requires that every tweet write triggers N cache writes — one per follower. For a user with 1,000 followers, this is trivial. For Lady Gaga (31 million followers in 2012), a single tweet triggered 31 million Redis writes synchronously in the write pipeline.

The failure modes were multiple:

**Write latency spikes:** Even if each Redis write takes 1ms, 31 million writes can't happen in parallel due to connection pool limits and Redis instance contention. The write pipeline queued and lagged behind real-time.

**Hot key contention in Redis:** Twitter sharded their timeline store by user ID. High-follower accounts' timelines weren't the problem — they're the source. The problem was write fan-out from one source to millions of shards. If multiple celebrities tweeted simultaneously, different shards saw load spikes.

**Write amplification at scale:** Twitter processes roughly 6,000 tweets per second at peak. Even at an average of 200 followers per user, that's 1.2 million timeline cache writes per second baseline. Celebrity tweets multiplied this by orders of magnitude. The fanout workers couldn't keep up. Users saw stale timelines; the queue of pending fanouts grew unboundedly during traffic spikes.

**Thundering herd on events:** Live events (Super Bowl, breaking news) caused simultaneous spikes in both tweet creation rate and read rate from accounts with millions of followers, compounding the problem.

The fundamental constraint was that fanout cost scaled with follower count, and follower counts were unbounded. The write path's cost was not predictable.

## What they tried first

Twitter first tried scaling the fanout infrastructure horizontally — adding more fanout workers, increasing Redis cluster size, and tuning connection pools. This helped with normal traffic but didn't address the O(N) cost per celebrity tweet, which was fundamentally a model problem rather than a capacity problem.

They also experimented with rate-limiting fanout for high-follower accounts — deferring the writes rather than eliminating them. This reduced peak write pressure but introduced visible lag: a celebrity's tweet might not appear in followers' timelines for minutes. User-visible latency for a core feature was not acceptable.

Caching popular timelines more aggressively at the CDN layer helped reduce read load but didn't address the write amplification. The write queue backing up under celebrity tweet load remained the core failure mode.

## The fix

The fix is a hybrid delivery model that selects fanout strategy per-account based on follower count, using a configurable threshold (N).

**For regular users (followers < N):** Fanout-on-write as before. When a tweet is posted, it is pushed into every follower's timeline cache (Redis) immediately. At read time, the feed is served directly from the follower's cached timeline. Fast reads, predictable cost.

**For high-follower accounts (followers ≥ N):** No fanout-on-write. The tweet is stored in the author's tweet store but not pushed to follower timelines. These are "celebrity" accounts in the system's model — the threshold N was reportedly set around 1 million followers but tunable.

**At read time (hybrid merge):** When a user loads their timeline, the system:
1. Reads the user's pre-computed timeline cache (populated by write-time fanouts from regular users they follow).
2. Looks up which celebrity accounts the user follows.
3. Fetches recent tweets for each celebrity account directly from their tweet stores.
4. Merges the two streams by timestamp.
5. Applies ranking/scoring.
6. Returns the blended result.

The merge is in-process (application layer) with bounded complexity — the number of celebrity accounts a user follows is small, and the per-celebrity fetch retrieves only the N most recent tweets.

**Additional optimizations:** Celebrity tweet stores are cached aggressively at multiple layers (a popular celebrity's tweets are read by millions of users simultaneously, making them excellent cache targets). The timeline home cache for regular followers is pre-warmed. The merge logic runs client-close (at edge PoPs) to minimize latency.

**The threshold problem:** Setting N too low means too many accounts fall into the fanout-on-read path, increasing read latency for many users. Setting N too high means the fanout workers are still overwhelmed. Twitter built a monitoring system that tracked queue depth and fanout latency per-percentile and adjusted thresholds based on observed performance.

## What it cost

The read path became significantly more complex. A timeline fetch now potentially involves multiple backend calls (timeline cache read + N celebrity tweet store reads), a merge operation, and ranking. P50 read latency for users following many celebrity accounts increased because of the merge step, even though celebrities' tweets appeared with less lag than the queued fanout model allowed.

The threshold introduces an operational parameter that must be tuned continuously. Edge cases exist: an account that crosses the threshold today has its fanout behavior change, potentially causing inconsistency for followers who have its tweets in their pre-computed caches. The system required explicit cache invalidation logic when accounts crossed the follower threshold.

## Takeaways

- **Write amplification scales with the fan-out factor; when that factor is unbounded, the write model breaks**: A fixed infrastructure budget cannot absorb arbitrary O(N) write multipliers from a small number of high-N accounts.
- **Hybrid models inherit the complexity of both approaches**: Read path now does N celebrity fetches and a merge; cache coherence is harder to reason about than a single write-time push.
- **Configurable thresholds need telemetry to be safe**: A tunable threshold without queue depth and latency monitoring is a misconfiguration waiting to happen.
- **Cache hierarchy design matters for the read path**: Celebrity tweets being good cache targets (high read fan-in, infrequent writes) makes the fanout-on-read approach practical; a poor cache hit rate would make the read-time fan-out expensive.
- **System cost depends on distribution, not just average**: The average tweet fan-out is manageable; the p99.9 (celebrities) is the system-breaking case. Design for the tail.

## Interview angle

This case comes up in news feed design questions, which are among the most common system design interview topics.

*"Design Twitter's home timeline"* or *"Design a news feed for a social network"* — both lead here. The key decision point is: fanout-on-write, fanout-on-read, or hybrid? A strong answer explains all three, states the tradeoffs clearly (write amplification vs. read latency vs. consistency), and arrives at the hybrid model by reasoning about follower count distributions.

Interviewers probe: How do you pick the threshold N? (Empirically, based on queue depth and latency SLOs.) What happens when a celebrity account drops below N followers? (Flush-or-migrate strategy for cache consistency.) How do you rank the merged results? (Out of scope for the data delivery design, but good to acknowledge.) What if a user follows 500 celebrities? (Bounded fan-out at read time — still O(500) not O(31M).)

The worst answer is committing to pure fanout-on-write without noting the celebrity problem. The second worst is pure fanout-on-read without noting it increases read latency for all users. Hybrid is the answer, and explaining *why* each direction breaks is what demonstrates depth.

---
*Source: Twitter Engineering Blog, 2013. Raffi Krikorian's QCon talk "New Tweets per second record, and how."*
