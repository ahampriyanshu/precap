# Platform security and the software supply chain

A production service executes more than its own source: base images, packages, build scripts, CI agents, deployment controllers, and credentials all participate. Supply-chain security arose from this chain of trust. The practical goal is to establish what code ran, who authorized it, and how much damage a compromised step could cause.

## Trace trust from commit to runtime

Protect the source branches and review path that control releases. Isolate untrusted pull-request execution from trusted release jobs. Use narrowly scoped, short-lived credentials for publishing and deployment. A compromised test dependency should not inherit an administrator token merely because a pipeline runs inside the organization.

Retain the source revision, builder identity, build inputs, dependency inventory, artifact digest, and promotion record. Signing identifies an authorized producer and protects integrity of the signed statement; it does not establish that the software has no vulnerabilities. Verification needs a policy describing which producer, repository, build path, and artifact are accepted.

An SBOM inventories components. Vulnerability scans compare that inventory against known advisories and need a triage policy that considers reachability, impact, remediation, and time. A scan with no findings is bounded evidence about known issues rather than a proof of safety.

## Restrict runtime privileges

This Kubernetes security-context fragment assumes the application can run without writing to its image filesystem and has explicit writable temporary volumes where needed.

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  seccompProfile:
    type: RuntimeDefault
containers:
  - name: api
    image: registry.example.test/orders:release-42
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: ["ALL"]
```

These controls reduce privileges and write surfaces. They do not prevent a legitimate application identity from leaking data it is allowed to read. Test filesystem assumptions before enforcement: runtime caches, compiled templates, and temporary uploads may need narrowly scoped writable mounts. Treat privileged containers, host namespaces, and access to the host runtime socket as exceptional capabilities.

RBAC controls Kubernetes API operations. NetworkPolicy can restrict network flows when enforced by the installed network implementation. Workload identity controls cloud actions. Admission policy can require approved registries and security settings. Each is a separate boundary; a namespace label alone does not establish all of them.

## Secrets have a distribution and rotation lifecycle

Store credentials in a managed secret system with access auditing and scoped identities. Avoid placing them in source, images, ordinary values, build logs, traces, or exception messages. A Kubernetes Secret's base64 representation provides no confidentiality by itself. Cluster datastore encryption, backups, API permissions, and runtime access all matter.

Rotation needs overlap and rollback semantics. Introduce a new credential, allow consumers to adopt it, verify use, then revoke the old one. A service that reads an environment variable at startup needs a rollout; a mounted file requires reload behavior. Revoking the old credential before all consumers reload can create an avoidable outage.

Prefer workload identity over a long-lived access key when the platform supports it. Credentials obtained through federation still need scoped trust conditions so an unrelated repository, service account, or branch cannot assume the role.

## Egress, tenancy, and data exposure

Restrict unnecessary outbound traffic and cloud metadata access where appropriate. An SSRF bug can convert application network access into credential or internal-service access. Validate destinations after DNS resolution and across redirects when proxying user-chosen URLs; enforce allowed schemes and destinations at a reliable boundary.

Shared clusters need a threat model for tenant workloads. Resource quotas protect some capacity boundaries; RBAC protects API access; network rules protect selected flows. Mutually untrusted code may require separate nodes, sandboxes, clusters, or accounts depending on the isolation requirement. Containers are one layer, not a universal sandbox guarantee.

Keep sensitive payloads out of routine telemetry. Redaction after ingestion may leave copies in caches, archives, or vendor systems. Decide what is collected before it leaves the process, and make deletion and retention policies cover backups and derived stores.

## Recovery includes compromised identities

A security incident needs containment that preserves recovery paths: revoke or restrict the compromised identity, identify artifacts and resources it could change, rotate affected secrets, and restore trusted deployment control. Rebuilding from a compromised runner reproduces the compromise.

Audit records should help answer who changed which policy, secret, image, and deployment. Protect their integrity and retention separately from ordinary application logs. Test that an emergency operator can recover access without relying on the single identity system or cluster currently failing.
