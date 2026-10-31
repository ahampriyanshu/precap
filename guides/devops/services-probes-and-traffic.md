# Services, probes, and graceful traffic changes

Pods are replaceable and their addresses change. A Kubernetes Service supplies a stable discovery and routing abstraction over a selected group of endpoints. Probes and termination behavior connect that routing layer to the application lifecycle. Most subtle rollout outages happen at those boundaries rather than in the syntax of a Deployment file.

## From a Service to a ready endpoint

A Service selects Pods by labels. EndpointSlice objects describe eligible backends and their conditions. The cluster's dataplane implements forwarding, using mechanisms that depend on the networking stack. The address seen by an application, session affinity, source-IP handling, and load distribution can therefore differ by Service type and deployment configuration.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: orders
spec:
  selector: {app: orders}
  ports:
    - name: http
      port: 80
      targetPort: http
```

The target name must match the container port name. A selector typo yields no intended endpoints even while the Pods appear healthy. DNS resolving `orders` establishes discovery of the Service, not that a ready backend exists or that application authorization will pass.

An ingress controller or Gateway API implementation routes external HTTP traffic toward Services. Installing route objects without their controller creates desired configuration with no executing dataplane. TLS certificates, route attachment rules, timeouts, and controller-specific capabilities need explicit ownership.

## Three probes answer three questions

Startup asks whether initialization has completed. Readiness asks whether this instance should currently receive traffic. Liveness asks whether restarting this process is the right recovery action. Conflating them can turn a dependency slowdown into fleet-wide restarts.

This container fragment assumes the application implements the endpoints and serves them on its named HTTP port.

```yaml
startupProbe:
  httpGet: {path: /health/startup, port: http}
  periodSeconds: 2
  failureThreshold: 60
readinessProbe:
  httpGet: {path: /health/ready, port: http}
  periodSeconds: 3
  failureThreshold: 2
livenessProbe:
  httpGet: {path: /health/live, port: http}
  periodSeconds: 10
  failureThreshold: 3
```

A startup probe delays the other checks until it succeeds, allowing roughly the configured startup failure window before restart. Readiness failures remove eligibility for ordinary Service traffic; they do not restart the process. A liveness failure can restart it. Design `/health/live` around an unrecoverable local failure, rather than a shared database's momentary availability.

Readiness should detect inability to admit useful work without requiring every optional dependency to be perfect. If all replicas lose readiness because one dependency slows down, remaining traffic may see complete unavailability. Sometimes bounded degraded responses or admission control give customers a better result. The endpoint's semantics are part of the product's reliability policy.

## Termination is a distributed transition

Pod termination, endpoint updates, ingress state, and application shutdown proceed asynchronously. The grace period includes time spent in a pre-stop hook. When that budget expires, remaining processes can be forcibly killed. Long-running requests and workers must fit the budget or recover through durable retry/checkpoint semantics.

```text
T0: deletion accepted; routing and termination begin converging
T1: application stops admitting work; eligible endpoints change
T2: old connections drain while new requests use other instances
T3: process exits, or remaining work reaches the hard deadline
```

This is a desired sequence, not a globally synchronized guarantee. Routing changes can reach different clients at different times. An ingress may reuse upstream connections. Test connection reuse, request cancellation, and streaming clients during actual rollouts; sleeping for an arbitrary duration only masks one possible propagation interval.

## Availability needs capacity as well as healthy labels

With `maxUnavailable: 0`, a Deployment intends to retain existing availability while new Pods become available. The rollout can still stall because a surge Pod cannot schedule, the new version never becomes ready, a quota blocks creation, or a database migration breaks both versions. A green readiness endpoint that ignores the critical request path can mark broken code ready.

A disruption budget coordinates voluntary evictions, while rollout settings control the Deployment's replacement behavior. Neither adds spare nodes. Long readiness stabilization and graceful drain windows can increase simultaneous resource use during deployment; reserve the capacity deliberately.

## Inspect each path independently

Port-forwarding to a Pod is useful for asking whether that process responds. It bypasses Service forwarding and the public ingress. A Service request tests another layer; a public synthetic request tests DNS, TLS, routing, and the application together. Preserve the distinction in incident evidence.

For a 503 after rollout, compare Service selectors, EndpointSlice conditions, Pod readiness, controller events, and direct backend response. For intermittent failures, correlate backend identity with requests; a single old configuration or zone-specific route can disappear in fleet averages.

The [Kubernetes cheatsheet](/cheatsheets/kubernetes/) contains these inspections. Treat a traffic transition as a protocol between the application and its platform, and verify the protocol under replacement as well as steady state.
