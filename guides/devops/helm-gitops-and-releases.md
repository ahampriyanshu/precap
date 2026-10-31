# Helm, GitOps, and safe releases

A deployment consists of related objects and values: image identity, ports, resources, routes, configuration, and sometimes jobs. Helm packages and templates that configuration. GitOps adds continuous reconciliation from versioned intent. These mechanisms reduce repeated manual work, while release safety still depends on compatibility and customer-visible evidence.

## Render a small, explicit contract

A chart should expose the values its consumers need and render predictable Kubernetes resources. A chart that parameterizes every field can become a second, less discoverable API. Keep defaults reasonable, validate the value schema, and test important combinations.

This Helm template fragment assumes a Deployment container context and a values file containing a repository and a real immutable digest.

```yaml
image: "{{ .Values.image.repository }}@{{ .Values.image.digest }}"
resources:
  {{- toYaml .Values.resources | nindent 2 }}
readinessProbe:
  httpGet:
    path: /health/ready
    port: http
```

Indentation depends on where the fragment is inserted; inspect the rendered resource before applying it. A successfully rendered chart proves template syntax and values, not admission acceptance, available capacity, or useful application behavior. Retain the chart version, values revision, and image digest as the release identity.

Keep secret values out of committed ordinary values files. A chart can reference a separately managed Secret or secret-controller resource. Protect rendered output and debug logs because templates may materialize secret data. Helm is not a secret vault.

## Give each resource one reconciliation owner

A GitOps controller observes a versioned source and applies differences to a cluster. It can repair drift and provide an audit trail of desired-state changes. It can also repeatedly restore a bad configuration. Source review and policy remain consequential.

Choose whether Helm runs directly as the release owner or is rendered/managed through a GitOps controller. Competing writers can fight over replicas, annotations, or whole objects. Horizontal autoscaling is another owner: avoid continuously resetting its replica count from a declarative field that a different controller keeps changing.

During an incident, an emergency live patch may be necessary. Record it, coordinate or suspend conflicting reconciliation where appropriate, then reconcile the source. Otherwise the controller can undo the mitigation moments later. Access to change the GitOps repository is effectively access to change production and deserves that trust boundary.

## Rollout strategy limits exposure differently

| Strategy | Mechanism | Important cost or failure mode |
| --- | --- | --- |
| Rolling update | Replace subsets over time | Old/new versions coexist; needs surge capacity |
| Blue/green | Maintain two environments and switch routing | Extra capacity; state compatibility still shared |
| Canary | Route a bounded fraction or cohort to new code | Needs routing control, comparison signals, enough traffic |
| Feature flag | Separate code deployment from behavior exposure | Flag state and combinations become operational inputs |

A canary fraction alone does not establish a clean experiment. A few large tenants or long-lived connections can skew exposure. Compare the intended population and guardrails, and check that errors are attributed to the actual version. A rare payment corruption may not occur during a short low-volume canary.

A rollback restores code/configuration only where those operations are reversible. Once new code writes a format older code cannot read, switching the image can make things worse. Define rollback eligibility before rollout, including flags, event payloads, and database changes.

## Expand and contract a schema

Suppose `full_name` must become `given_name` and `family_name`. Dropping the old column in the same release breaks old Pods still running during a rolling update. A compatible sequence is:

1. Add nullable new columns using an operation whose lock behavior is understood.
2. Deploy code that tolerates both formats and defines the authoritative write representation.
3. Backfill in bounded, restartable batches without overwriting newer writes.
4. Switch reads after verifying completeness and agreement.
5. Remove the old representation only after old code and delayed messages no longer require it.

A backfill's cursor and progress are durable work state. Index creation, constraint validation, and schema locks each need a plan based on the database engine and data volume. “The SQL is one line” says little about production impact.

```sql
-- A bounded batch selected by a durable cursor; transaction wrapper omitted.
UPDATE customer
SET display_name = full_name
WHERE id > :last_id
  AND id <= :batch_end
  AND display_name IS NULL;
```

This example copies a representation without parsing names. Real name splitting requires a product policy, so it must not be fabricated by a migration heuristic. The guard protects an already populated field; a production dual-write policy must also establish whether a concurrent edit can update either representation and how disagreement is reconciled.

## Make promotion evidence durable

A production gate should inspect artifact provenance, configuration diff, migration compatibility, rollout health, and critical user outcomes. A Kubernetes “available” condition or Helm wait result is a useful platform signal but does not verify checkout, authorization, or background delivery.

Progressive delivery needs explicit stop conditions: excess error rate, latency regression, saturation, data mismatch, or failed business invariant. The automated response might pause exposure, roll back a compatible version, or page the owner; it should not issue an unsafe generic rollback after every failure.

Use the [Helm cheatsheet](/cheatsheets/helm/) for linting, rendering, release inspection, and controlled changes. Keep command syntax separate from the release compatibility model.
