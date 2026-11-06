# The BGP leak that took down Cloudflare

## Context

On June 24, 2019, a significant portion of internet traffic destined for Cloudflare's network was rerouted through a Pennsylvania-based ISP and subsequently dropped or misdirected. The incident lasted roughly two hours and affected Cloudflare's DNS resolver (1.1.1.1), CDN, and DDoS mitigation services globally. The root cause was a BGP route leak propagated by Verizon's AS701 — a tier-1 ISP that should have filtered it. The incident illustrated how BGP's trust-based design and the absence of enforced origin validation creates systemic fragility across the entire internet.

## The problem

BGP (Border Gateway Protocol) is the routing protocol that governs how autonomous systems (ASes) on the internet exchange reachability information. It is built on trust: when an AS announces that it can reach a set of IP prefixes, neighboring ASes generally believe it and propagate the announcement. There are no cryptographic checks on route origin validity.

The chain of events on June 24:

1. **Origin misconfiguration:** A small ISP in Pennsylvania (Allegheny Technologies, AS33154) redistributed Cloudflare's IP prefixes into their BGP announcements. This was a misconfiguration — they were not authorized to originate those prefixes.

2. **Customer route propagated upward:** AS33154 was a customer of DQE Communications, which was in turn a customer of Verizon's AS701. The route for Cloudflare's prefixes traveled up this chain.

3. **No max-prefix filtering at AS701:** Verizon (AS701), a tier-1 ISP, accepted and propagated the leaked routes to its full peering mesh — roughly 212,000 routes from a single customer connection were accepted. Standard operational practice is to apply max-prefix limits on customer sessions (a customer connection should not originate more than a few hundred prefixes; accepting tens of thousands is a signal of a leak). AS701 had no such filter configured for this customer.

4. **BGP's prefer-more-specific rule:** Cloudflare uses anycast — the same IP address is announced from many PoPs globally. BGP normally routes traffic to the nearest anycast node. The leaked routes, however, were more specific (longer prefix match) than Cloudflare's legitimate announcements in some cases, or were simply closer in AS path length from some vantage points, causing traffic to prefer them.

5. **Traffic dropped:** Traffic routed to AS33154 for Cloudflare's prefixes was not actually delivered to Cloudflare — Cloudflare had no presence there. The traffic was blackholed.

RPKI (Resource Public Key Infrastructure) provides a mechanism to cryptographically validate that an AS is authorized to originate a given prefix via Route Origin Authorizations (ROAs). Cloudflare had published ROA records. AS701 did not enforce RPKI Route Origin Validation (ROV), so the invalid origin announcement was not rejected.

## What they tried first

During the incident, Cloudflare's immediate response was operational: contacting Verizon's NOC to request manual route withdrawal, and reaching out to other tier-1 peers to suppress the leaked routes. This is the standard incident response for BGP leaks. It worked, but slowly — BGP convergence after manual intervention takes time, and NOC response times during an active incident vary.

Cloudflare also attempted to outcompete the leaked route by announcing more specific prefixes (splitting their /19 into /20s), which would take priority under BGP longest-prefix-match. This had partial success in some regions but was not universally effective because some upstream peers still preferred the leaked path due to AS path attributes.

None of these were fixes — they were incident containment steps. The underlying problem was that BGP's trust model had no enforcement layer.

## The fix

The fix operates at two levels: what Cloudflare could control themselves, and what required industry-wide change.

**RPKI ROA publication and advocacy:** Cloudflare had already published ROA records before the incident — these records cryptographically bind a prefix to an authorized origin AS. The gap was that AS701 didn't enforce RPKI Route Origin Validation. Cloudflare intensified advocacy within the IETF and directly with ISPs to enforce ROV (drop routes that fail RPKI validation). They also made their RPKI tools publicly available to lower the barrier for other operators to publish ROAs.

**Internal prefix monitoring:** Cloudflare built alerting on origin-AS deviations. Any BGP update that announces a Cloudflare prefix from an unexpected origin AS triggers an immediate alert to the NOC. This reduces time-to-detect from "user reports service down" to automated detection within seconds of route propagation.

**MANRS participation:** Cloudflare joined and actively promoted MANRS (Mutually Agreed Norms for Routing Security), a framework requiring participating networks to implement prefix filtering, anti-spoofing, coordination, and global validation.

**Anycast resilience review:** The incident revealed that anycast provides partial but not complete resilience to BGP manipulation. Cloudflare reviewed their anycast PoP configuration and prefix announcement strategy to minimize the impact window of similar leaks in the future.

The honest answer is that a complete fix requires Verizon and all tier-1 ASes to enforce RPKI ROV and apply max-prefix filters on customer sessions. Neither Cloudflare nor any single operator can force this — it requires coordinated industry action. Progress has been made since 2019; several major ISPs now enforce ROV, but adoption is not universal.

## What it cost

The incident affected Cloudflare services for approximately two hours on June 24, 2019. Customer-facing impact included degraded or unavailable DNS resolution, CDN cache misses served from origin (or dropped), and DDoS protection gaps. The reputational cost was significant for a company whose value proposition is network reliability. Post-incident, Cloudflare published a detailed public postmortem, which itself became a vehicle for RPKI and MANRS advocacy. Engineering investment went into the monitoring and alerting systems described above, and substantial staff time into industry coordination efforts.

## Takeaways

- **BGP is a trust-based protocol with no built-in origin validation**: Any AS can announce any prefix; propagation depends entirely on neighbors filtering correctly.
- **Max-prefix filtering on customer sessions is a basic operational hygiene that AS701 skipped**: A customer session accepting 212,000 routes is an obvious anomaly that should have been caught automatically.
- **RPKI provides cryptographic origin validation but only works if enforced**: Publishing ROA records is not sufficient; upstream ASes must enforce ROV for the validation to have teeth.
- **Anycast reduces but does not eliminate BGP manipulation risk**: A more-specific prefix leak can still pull traffic away from legitimate anycast nodes.
- **Incident response for BGP problems depends on NOC availability and BGP convergence time**: Automated alerting on origin-AS deviations is the only way to reduce detection time to seconds rather than minutes.

## Interview angle

BGP leak incidents come up in reliability and networking discussions, usually in the context of questions about internet routing fundamentals or large-scale outage postmortems.

*"How does BGP work, and what are its failure modes?"* — The expected answer covers AS path propagation, trust model, longest-prefix-match, and the failure modes: route leaks (incorrect origin), route hijacks (malicious origin), and misconfiguration propagation.

*"If you were building a network-dependent service, how would you defend against BGP manipulation?"* — Answers should cover RPKI ROA publication, monitoring for origin-AS deviations, relationships with upstreams for rapid NOC escalation, and anycast PoP distribution (more PoPs means a leak only affects the subset of users who route toward the leaking AS).

A common follow-up: What's the difference between a route leak and a route hijack? A leak is accidental redistribution of legitimate routes; a hijack is deliberate announcement of prefixes the attacker doesn't control (e.g., to intercept traffic). BGP security mechanisms — RPKI, BGPsec — address both, with RPKI focused on origin validation and BGPsec on full-path validation (much harder to deploy).

---
*Source: Cloudflare Blog, June 2019. "Cloudflare outage on June 24, 2019."*
