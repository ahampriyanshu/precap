# From first deploy to production

The frontend and API work locally. Now make that same application reachable by customers, replaceable without guesswork, and recoverable when a dependency fails. Follow one service through those pressures: a static frontend, a Python API, PostgreSQL, and background work added when requests become too slow to finish synchronously.

Each stage keeps the previous stage's responsibilities. Docker does not manage database compatibility; Kubernetes does not establish a recovery policy. The useful progression is the problem that becomes expensive enough to justify another control. The linked cheatsheet contains the operational commands for each stage.

## Start with a deployment contract

Before choosing a platform, identify what must run and what must survive replacement. The frontend is a versioned bundle; the API is a long-lived process; PostgreSQL owns durable application state. An uploaded file on the API's local disk becomes a hidden dependency on one machine. Move durable uploads to object storage before expecting interchangeable workers.

Write the runtime contract in the repository. This example describes application requirements, rather than a manifest consumed by a deployment tool:

```yaml
api:
  command: python -m app
  port: 8000
  required_config: [DATABASE_URL, OBJECT_BUCKET]
  health_paths: [/api/health/startup, /api/health/ready, /api/health/live]
  shutdown: stop_accepting_then_drain
state:
  database: PostgreSQL
  uploads: object_storage
release_identity: source_revision_and_image_digest
```

The API package must implement these behaviors. Agree on graceful shutdown, maximum request duration, connection limits, and configuration validation at startup. Identify jobs that need a separate worker and migrations that run once per release. A deployable unit is more than a command that starts successfully.

This contract also prevents environment drift: a staging service that uses different storage semantics or bypasses authentication provides weak evidence about production behavior. Differences should be explicit and reviewable.

[Commands: establish the target environment](/cheatsheets/devops/#deployment-context)

## Make the process survive the terminal

A reasonable first deployment is a Linux VM such as EC2: install the runtime, copy a release, supply configuration, and run the API. The first failure is often mundane: the SSH session ends, the process crashes, or a reboot leaves nothing listening. A process supervisor owns restart and boot behavior.

For a host-based deployment, an illustrative systemd unit contains:

```ini
[Service]
Type=exec
User=precap
WorkingDirectory=/srv/precap/current
EnvironmentFile=/etc/precap/api.env
ExecStart=/srv/precap/current/.venv/bin/python -m app
Restart=on-failure
RestartSec=3
TimeoutStopSec=40
```

The service account, release directory, virtual environment, environment file, and application already exist. A complete unit also declares its unit metadata and installation target; the cheatsheet includes that form. Bind the host-based API to loopback when Nginx is the public entry point. Handle termination signals so systemd's stop deadline allows in-flight requests to finish. [systemd documents the supervision lifecycle](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html).

Keep releases in separate directories and change the active pointer deliberately. Installing packages into a running release makes rollback ambiguous. Centralize logs or configure retention: a filled filesystem can stop the app and its diagnostics together. One host remains a failure domain even when its process restarts reliably; document how to replace it from known inputs.

[Commands: supervise and diagnose the host process](/cheatsheets/devops/#host-and-process)

## Put DNS and TLS at the public boundary

A running process is not yet a reliable public service. DNS resolves the public name; a security group permits the intended ingress; a TLS endpoint presents a valid certificate; a reverse proxy routes requests. Diagnose these boundaries independently. A successful local curl says nothing about public DNS, certificate renewal, or the load balancer's target health.

On one host, Nginx can terminate TLS, serve the frontend, and forward `/api/` to the API. The request path is:

```text
Browser -- HTTPS --> Nginx :443
                        |-- /       --> versioned frontend files
                        |-- /api/*  --> API on 127.0.0.1:8000
                                           |--> private PostgreSQL
```

Keep the API and database private. Permit port 80 only where redirects or certificate validation require it; automate renewal and test it. A managed load balancer with managed certificates can own this boundary as the deployment grows. Define which proxy headers the application trusts, body and request time limits, and how client IPs are preserved through trusted hops.

Routing details matter: Nginx `proxy_pass` with a URI can replace the matched path prefix. The cheatsheet's upstream has no trailing URI, so `/api/orders` stays `/api/orders`. SPA fallback belongs to frontend routes, not failed API calls. A static frontend release can also need cache rules: hashed assets can live longer than the HTML that references them. See [Nginx URI forwarding](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass).

[Commands: inspect DNS, certificates, and proxy routing](/cheatsheets/devops/#dns-tls-and-ingress)

## Turn the release into an immutable artifact

Manual host setup accumulates hidden inputs: OS packages, runtime versions, native libraries, and yesterday's edits. A container image packages the application's filesystem and startup configuration. The same tested image can move between environments; runtime secrets and environment-specific configuration stay outside it.

A small Python image can start with this Dockerfile. `BASE_IMAGE` must be an approved Python base reference pinned by digest; the lock file includes hashes for all dependencies, and `app` provides `__main__.py`.

```dockerfile
ARG BASE_IMAGE
FROM ${BASE_IMAGE}
WORKDIR /srv/api
COPY requirements.lock .
RUN pip install --no-cache-dir --require-hashes -r requirements.lock
COPY app/ app/
USER 10001
CMD ["python", "-m", "app"]
```

The API must listen on the container interface; publish its host port on loopback behind Nginx. Give the process only the writable storage it needs. A multi-stage build can keep compilers out of the runtime image when native dependencies require them. `.dockerignore` prevents accidental inclusion of local credentials and build clutter.

Tags are convenient names that can move. Promote the registry digest of the tested artifact and retain source provenance. Pinning a vulnerable image forever is not maintenance: rebuild deliberately when dependencies change. Build credentials belong in temporary secret mounts, not image layers, `ARG`, or `ENV`; [Docker documents that boundary](https://docs.docker.com/build/building/secrets/).

[Commands: build, inspect, and run the release artifact](/cheatsheets/devops/#images-and-artifacts)

## Automate verification and promotion

Once two people deploy the service, personal command histories become an unreliable release process. CI makes verification repeatable; CD replaces the target environment with a known release. Jenkins is one implementation of that coordination, alongside other pipeline systems.

Separate building an artifact from promoting it. The release flow is:

```pseudocode
source revision -> unit and integration checks
                -> build image -> publish candidate
                -> record registry digest
recorded digest -> smoke-test exact image -> deploy staging
                -> verify a real request
                -> promote the same digest -> observe production
```

Use a clean, trusted agent and project-owned checks. A branch's arbitrary code must not inherit production credentials. Give the build role registry write access and the deploy role only the authority needed for its environment. Cache dependencies to save time while keeping their versions pinned; a cached result must not silently replace required verification.

Serialize conflicting deployments to one environment. Record who promoted which digest and configuration revision. On failure, distinguish an image that never started from one that passed readiness but broke the customer journey. A successful pipeline exit is evidence about its checks, not every possible product behavior.

Automating a fragile manual procedure makes it fail faster. Define migration compatibility, health signals, and rollback eligibility before turning an SSH command into the production deploy stage. [Jenkins pipeline syntax](https://www.jenkins.io/doc/book/pipeline/syntax/) provides the mechanics; the team still owns the release policy.

[Commands: verify an image and structure a Jenkins pipeline](/cheatsheets/devops/#ci-and-promotion)

## Change data without breaking the previous release

Rolling deployments run two application versions at once. An immediate column rename can break old workers; rolling the image back cannot recreate data deleted by a migration. Treat schema compatibility as a release constraint.

For a `full_name` to `display_name` transition, expand first. This PostgreSQL migration assumes the `users` table exists and runs through the team's migration system:

```sql
BEGIN;
SET LOCAL lock_timeout = '2s';
ALTER TABLE users ADD COLUMN display_name text;
COMMIT;
```

Then deploy compatible code, maintain the required writes during coexistence, and backfill historical rows in bounded batches. Define which field is authoritative and how concurrent edits avoid being overwritten. Check completion, switch reads, wait until old application versions and consumers are gone, then contract the old column in a later release.

A lock timeout avoids waiting indefinitely; it does not prove an alteration is cheap or safe. Rehearse changes against realistic data volume, inspect lock requirements and replication lag, and give one controlled job ownership of migration execution. A hundred replicas racing to migrate at startup creates a new failure mode. PostgreSQL's [ALTER TABLE reference](https://www.postgresql.org/docs/current/sql-altertable.html) documents operation-specific locking and rewrite behavior.

State the rollback window for each release. An additive application change may be reversible while the destructive cleanup is not. Backups support recovery under an explicit data-loss and time objective; restoring yesterday's database to fix today's interface bug is a very different operation from selecting yesterday's image.

[Commands: inspect locks and perform a bounded backfill](/cheatsheets/devops/#schema-and-data-migrations)

## Declare infrastructure and protect its state

The service now depends on networking, a registry, database access, storage, and workload identities. Recreating them through console clicks hides ownership and makes staging hard to compare with production. Terraform expresses desired infrastructure, calculates a plan, and records the bindings between configuration and managed resources.

An S3 backend fragment for Terraform with native lock-file support looks like:

```hcl
terraform {
  backend "s3" {
    bucket       = "team-terraform-state"
    key          = "production/precap.tfstate"
    region       = "ap-south-1"
    encrypt      = true
    use_lockfile = true
  }
}
```

The backend bucket and its access controls must already exist. Separate state by ownership and environment to bound change scope. Restrict access, enable recoverable state history, and use short-lived identities. State and saved plans can contain sensitive data; marking an output sensitive only limits display.

Review the exact plan that will be applied, including replacement and deletion. Locking coordinates writers to one state; it does not detect every architectural conflict between independent states or stop an authorized bad plan. Import existing resources deliberately, investigate drift, and pin providers with a committed dependency lock file. [HashiCorp's S3 backend documentation](https://developer.hashicorp.com/terraform/language/backend/s3) covers locking and permissions.

Infrastructure code makes a change reviewable, not consequence-free. A database replacement, subnet change, and IAM expansion deserve different scrutiny. Avoid making one enormous state the only path to change anything, or many tiny states whose dependencies nobody can explain.

[Commands: review and apply a saved Terraform plan](/cheatsheets/devops/#terraform-and-state)

## Scale the constrained resource

A second API instance needs shared state, a load balancer, and connection draining. It does not automatically double useful throughput. Inspect where requests spend time: CPU, database contention, connection acquisition, downstream latency, or a queue. More waiting workers can increase pressure on the same bottleneck.

Connection pools expose a common multiplication error:

```python
replicas, processes, pool_size = 8, 4, 10
potential_connections = replicas * processes * pool_size
database_limit, reserved = 400, 100
print(potential_connections)                      # 320
print(potential_connections <= database_limit - reserved)  # False
```

Design pool sizes and maximum replicas together. Account for overflow pools, background workers, migrations, and operational access. An index or reduced query count may deliver more than another compute tier. CPU-based autoscaling misses a service waiting on slow I/O; queue workers often need backlog age and drain rate as well as depth.

Decouple slow work only after defining durable acceptance, ownership, retries, idempotency, and customer-visible completion. A queue absorbs a burst when the system can eventually drain it; it cannot fix a permanently higher arrival rate. Bound concurrency and retries, shed optional work, and keep useful overload responses.

Load testing should cover the dependency path and recovery from saturation. Test scale-in and shutdown too: shrinking the fleet during long requests or leased jobs exposes different bugs from adding empty workers.

[Commands: locate saturation before changing replicas](/cheatsheets/devops/#capacity-and-bottlenecks)

## Choose a scheduler when fleet work becomes the constraint

A growing fleet adds placement, host replacement, service discovery, rollout coordination, and capacity bookkeeping. A scheduler takes ownership of desired workloads and reconciles actual placement. That is the reason to consider orchestration; using containers alone does not require operating Kubernetes.

| Operating pressure | A plausible next step | Work the team still owns |
| --- | --- | --- |
| A few stable services | Automated host releases or a PaaS | App recovery, data, capacity and dependencies |
| Standard containers and managed cloud integration | ECS or another managed container platform | Task contracts, networking, scaling and IAM |
| Shared policy, varied workloads, or platform needs across teams | Kubernetes with a capable platform owner | Add-ons, upgrades, policy, capacity and diagnosis |

Kubernetes separates a control plane that manages desired state from nodes that execute Pods. A Deployment manages replicated Pods; a Service provides a stable endpoint over matching ready backends. Scheduling needs resource requests and available capacity. Persistent data also needs a storage and recovery design; rescheduling a container does not reconstruct its lost local disk.

Managed control planes reduce one responsibility, while DNS, networking, image pulls, quotas, and application health remain consequential. Prefer the smallest operating model the team can diagnose under pressure. Identify who upgrades the platform, who handles node failures, and how a service owner distinguishes an app incident from a cluster incident. [Kubernetes' component overview](https://kubernetes.io/docs/concepts/overview/components/) describes those boundaries.

[Commands: trace a workload from controller to Service](/cheatsheets/devops/#scheduler-and-service-discovery)

## Make Kubernetes and Helm express application behavior

Kubernetes needs accurate workload contracts. Requests influence scheduling and CPU utilization targets; limits constrain runtime resource use. CPU throttling and memory termination have different symptoms. Startup, readiness, and liveness also ask different questions.

This is a container-spec fragment inside a Pod template, not a complete Deployment:

```yaml
name: api
ports: [{containerPort: 8000}]
resources:
  requests: {cpu: "250m", memory: "256Mi"}
  limits: {cpu: "1", memory: "512Mi"}
startupProbe:
  httpGet: {path: /api/health/startup, port: 8000}
  failureThreshold: 30
  periodSeconds: 2
readinessProbe:
  httpGet: {path: /api/health/ready, port: 8000}
livenessProbe:
  httpGet: {path: /api/health/live, port: 8000}
```

The thresholds require measurement. Startup protects slow initialization; readiness controls traffic eligibility; repeated liveness failure can restart a container. Making liveness depend on an unavailable database can create a restart storm. Make readiness reflect the service's ability to serve its intended traffic without needlessly draining every replica during a shared dependency incident. [Probe semantics are documented separately](https://kubernetes.io/docs/concepts/workloads/pods/probes/).

Helm packages and templates related manifests. Use reviewed values to vary image digest, capacity, and environment settings; inspect the rendered result before deployment. Helm does not replace a scheduler, Terraform state, or database migrations. Horizontal autoscaling additionally needs appropriate metrics and bounds; Pod disruption budgets constrain voluntary eviction and do not guarantee capacity during node failure.

[Commands: render charts and diagnose rollout health](/cheatsheets/devops/#kubernetes-and-helm)

## Separate configuration from authority

As services multiply, copying one powerful credential into every container creates a broad failure boundary. Give a workload an identity and the minimum permissions its actual operations require. Separate the ability to read an application's secret from the ability to change any secret or deploy any workload.

A Kubernetes ServiceAccount identifies the workload to the cluster. Cloud access needs a configured identity integration and an independently scoped cloud role; naming a ServiceAccount alone grants no AWS permissions. CI, infrastructure automation, the API, and queue workers should have distinct authorities. Check both cloud IAM and Kubernetes RBAC when a request is denied.

Use ordinary configuration for nonsecret environment choices and a managed secret system for credentials that need access control and rotation. Kubernetes Secret values are encoded, so storage encryption and API access restrictions still matter. A frontend bundle is public configuration: embedding a credential at build time publishes it to users.

Rotation is a flow: change the authoritative credential, propagate it to consumers, confirm new connections use it, and retire the old credential after the overlap window. Environment-injected values usually require process replacement to change. A mounted value changing on disk does not prove the application reloaded its connection pool. [Kubernetes documents Secret constraints](https://kubernetes.io/docs/concepts/configuration/secret/).

Record the operator actions needed during an incident without exposing values in logs, shell histories, or diagnostic bundles. A successful deploy with stale authority can fail only when the old connection finally expires.

[Commands: inspect identity and permissions without printing secret values](/cheatsheets/devops/#identity-config-and-secrets)

## Give releases one owner and verify the journey

At this point, decide who owns desired application state. CI can directly deploy a Helm release, or CI can publish an artifact and update a configuration repository that a GitOps controller such as Argo CD reconciles. Both are workable; two competing writers to the same resources cause confusing drift.

The GitOps form separates build authority from cluster reconciliation:

```text
CI -> tested image digest -> reviewed config commit
                                    |
                                    v
                          Argo CD -> Kubernetes
                                    |
                                    v
                        readiness + journey checks
```

A manual cluster edit can be reverted by reconciliation when self-healing is configured. Change the desired configuration through its owner, and document emergency overrides and how they are reconciled afterward. Argo CD's [automated-sync policy](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/) makes pruning and self-healing explicit choices.

Watch a real path after release: ingress, authentication, a database operation, and completion of accepted asynchronous work. Rollout readiness and Helm's wait condition establish resource-level signals, not customer correctness. Use canaries or staged exposure where the blast radius justifies them, with defined comparisons and stop conditions.

Rollback selects a compatible earlier artifact and configuration. Check schema compatibility, external effects, and the current desired-state owner before issuing it. In GitOps, changing only a live Deployment can be undone by the controller; reverting the approved configuration restores its source of truth. A refund already sent to a provider still needs reconciliation, even after a successful image rollback.

[Commands: inspect a release and choose the right rollback path](/cheatsheets/devops/#release-and-rollback)

## Operate recovery and cost as product promises

Deployment is complete only in the narrow sense that a release is running. Operations asks whether the user journey keeps its promise. Define experience-based SLOs, actionable alerts, and an owner for accepted work that has not completed. Monitor saturation and queue age alongside request success; a healthy API can continue acknowledging work while its workers are stopped.

During an incident, establish impact and timeline, correlate it with releases and dependencies, then choose a bounded mitigation. Rolling back, shedding load, disabling an optional capability, and increasing capacity solve different failures. Avoid changing every knob at once. Preserve evidence and verify recovery for work accepted during the incident, including duplicates or ambiguous external effects.

Set RPO and RTO per durable system. A backup existing is weaker evidence than restoring it into an isolated target and verifying application-level invariants. Exercise lost credentials, damaged data, host replacement, and regional dependencies according to the promises actually made. Recovery steps need identities, access, capacity, and people who can execute them.

Measure cost per useful outcome as well as total spend. Idle replicas, oversized requests, egress, retained logs, and database capacity have different owners and scaling behavior. Cheap compute that increases incidents or operator load may cost more overall.

The operating model is now concrete: an artifact and configuration identify the release; one controller owns placement; authoritative stores own durable state; observability identifies impact; and rehearsed procedures restore the promised outcome. Keep each ownership boundary explicit as the platform evolves.

[Commands: collect evidence and rehearse recovery](/cheatsheets/devops/#incidents-recovery-and-cost)
