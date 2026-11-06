# Building resilience with Chaos Monkey

## Context

Netflix migrated from their own data centers to AWS starting in 2008 and completed the move by 2016. Early in the migration, the team discovered that designing for cloud infrastructure required a different mental model than designing for owned hardware. Cloud instances terminate unexpectedly; network partitions are routine; availability zones fail independently. In 2010, an AWS EBS outage took Netflix down for several hours, exposing how many implicit reliability assumptions had been baked into service design. The Chaos Engineering program was Netflix's response: make failure a first-class, continuous input to the system.

## The problem

Reliability assumptions are invisible until they fail. Services developed on the implicit assumption that dependencies will respond. In practice, an engineer writing a service call might handle the success case thoroughly and handle errors with a catch block that logs and re-throws — not because they're careless, but because they've never actually seen the dependency fail in a way that required a different response.

This creates a gap between the system's assumed fault model (documented in design docs, discussed in code review) and its actual fault model (what the code actually does when a dependency is unavailable). The gap is only visible when the dependency fails in production.

The specific AWS EBS outage in 2010 exposed this: Netflix services that called EBS-backed storage implicitly assumed it would respond. When EBS became unavailable, services blocked on I/O, threads exhausted their pools, and the entire call chain backed up. The circuit breakers that should have opened to protect upstream callers weren't implemented, because there had been no forcing function to implement them.

The broader problem is organizational: without regular exposure to failure, engineering teams optimize for the success path. Code review doesn't catch missing fallbacks. Load tests don't simulate dependency failures. Oncall runbooks describe what to do after things break, not how to build things that don't break.

Failure must be introduced deliberately and continuously to close the gap between assumed and actual fault models. Waiting for production failures is too expensive — both in customer impact and in the fire-drill learning environment, which produces fewer insights than calm, controlled experiments.

## What they tried first

Netflix initially relied on standard reliability practices: redundant deployments across availability zones, load balancing, automated restarts on health check failure. These addressed infrastructure-level redundancy but did not address application-level dependency failures. A service could have three instances across three AZs and still fail completely if none of the instances had a fallback when a shared dependency was unavailable.

The team also ran targeted failure drills manually: oncall engineers would occasionally kill instances or block network traffic in staging environments to test fallback behavior. This was useful but infrequent, labor-intensive, and limited to staging — where load patterns and dependency graphs were approximations of production, not the real thing.

The manual drill approach didn't scale across a growing number of services and teams. Its infrequency meant that code written between drills accumulated new assumptions, resetting the gap. What was needed was continuous, automated failure injection in production — not a periodic exercise.

## The fix

Chaos Monkey, released in 2011, is an automated agent that runs during business hours and randomly selects EC2 instances within Netflix's production fleet to terminate. The choice of business hours is deliberate: failures during working hours mean engineers are available to observe and respond, learning from each failure rather than discovering problems in a 3am page.

**What Chaos Monkey forces:** Every service must be designed to survive the loss of any single instance. This rules out session affinity (stateful connection pinning to a specific instance), in-memory state that can't be reconstructed, and synchronous dependencies on services that don't have their own redundancy.

**The extended toolkit:**
- **Chaos Gorilla:** Terminates all instances in an entire availability zone. Forces services to operate with one AZ fully absent, testing cross-AZ redundancy.
- **Chaos Kong:** Simulates an entire AWS region becoming unavailable. Forces design of cross-region active-active or active-passive failover. At Netflix's scale, region failover is a business-critical capability (not just a disaster recovery exercise).
- **Latency Monkey:** Injects artificial latency into service calls. Surfaces timeout misconfigurations, missing circuit breakers, and cascading slowdowns that don't appear during instance termination.
- **Conformity Monkey:** Checks that instances conform to best practices (e.g., attached to an auto-scaling group, associated with correct security groups). Not a failure injector, but part of the operational discipline.

**What the tool produces organizationally:** Chaos Monkey doesn't fix anything on its own. Its value is as a forcing function. Services that aren't resilient get broken regularly in production. Teams that own those services have to fix them or face repeated incidents. The discipline — circuit breakers, fallbacks, bulkheads, cache-aside for dependency failures — becomes a requirement rather than an optional improvement.

Netflix documented the emerging practice as "Chaos Engineering": run controlled experiments in production, define a steady state, inject failure, observe the system's response, and learn from deviations. The Principles of Chaos Engineering (published 2016) formalized the methodology.

## What it cost

Chaos Monkey requires genuine organizational commitment. Services must be designed to handle instance loss, which means more engineering work upfront: session externalizing, fallback code paths, circuit breakers, health check correctness. Teams owning unresilient services bear the cost of incidents caused by Chaos Monkey, which created friction initially.

Running failure experiments in production carries real risk. Chaos Kong exercises have occasionally revealed that failover assumptions were wrong — the drill itself caused an outage. These are learning events by design, but they have real user impact. The program requires a culture that treats production failures during controlled experiments differently from uncontrolled outages, which takes deliberate management alignment.

## Takeaways

- **Implicit reliability assumptions are only visible through failure**: Code review and design review catch logical bugs, not missing fallbacks for failure modes that haven't been seen before.
- **Continuous failure injection is more effective than periodic drills**: Gaps accumulate between drills; continuous injection catches regressions as they're introduced.
- **Business-hours termination is a feature, not a limitation**: Engineers learn more from a failure they observe during the workday than from a 3am page.
- **Circuit breakers and fallbacks must be production-verified, not just code-reviewed**: A circuit breaker that's never been triggered may not work correctly when it's needed.
- **Chaos Engineering is an organizational practice, not a tool**: Chaos Monkey is a mechanism; the discipline that it enforces across engineering teams is the actual deliverable.

## Interview angle

Chaos Engineering comes up in reliability and distributed systems interviews, particularly when discussing how to build services that tolerate partial failures.

*"How does Netflix ensure reliability at scale?"* or *"How would you design a system to handle dependency failures?"* — Chaos Engineering is a strong answer to the second-order question: not just "what mechanisms do you use" (circuit breakers, retries, timeouts) but "how do you know those mechanisms work?" The answer is deliberate failure injection.

Interviewers probe: What's the difference between a circuit breaker and a retry with backoff? (Circuit breakers prevent calls to a known-failing dependency; retries are for transient failures — both are needed.) How do you define a "steady state" for a chaos experiment? (A measurable metric: requests per second, error rate, p99 latency — whatever the SLA is based on.) What happens if Chaos Kong reveals that your cross-region failover is broken? (That's the goal — better to discover it in a controlled experiment than during an actual region failure.)

The key insight to demonstrate: resilience can't be assumed or code-reviewed into existence. It must be continuously verified against real production conditions.

---
*Source: Netflix Tech Blog, 2011. "5 Lessons We've Learned Using AWS." Principles of Chaos Engineering, 2016.*
