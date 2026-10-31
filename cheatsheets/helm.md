# Helm

A command flow for charts and existing releases. Examples assume a chart at `./charts/orders`, reviewed staging values, and a configured `staging-cluster` context. Core render/inspect commands work across common Helm 3 and 4 workflows; verify version-specific rollout flags before adopting them. The lesson explains [Helm, GitOps, and release compatibility](/guides/devops/helm-gitops-and-releases/).

## Check versions and chart inputs

Inspect dependency declarations and lockfiles before downloading chart packages.

```bash
helm version
helm show chart ./charts/orders
helm dependency build ./charts/orders
helm lint ./charts/orders -f staging-values.yaml
```

Dependency build follows the chart lockfile when present. Lint catches some chart mistakes but cannot prove server admission or application correctness. Avoid treating a package update as a harmless validation step.

## Render and inspect the actual resources

Render with the exact release name, namespace, and values intended for the environment.

```bash
helm template orders ./charts/orders --namespace orders \
  -f staging-values.yaml > rendered.yaml
kubectl --context staging-cluster -n orders apply --dry-run=server -f rendered.yaml
```

Rendered output may contain secrets; protect the file and logs. Server dry-run checks the target API/admission path without ordinary persistence, subject to webhook behavior. It does not prove capacity or a functional release.

## Inspect an existing release

Read the recorded configuration and deployed manifest before changing them.

```bash
helm list --kube-context staging-cluster -n orders
helm status orders --kube-context staging-cluster -n orders
helm history orders --kube-context staging-cluster -n orders
helm get values orders --all --kube-context staging-cluster -n orders
helm get manifest orders --kube-context staging-cluster -n orders
```

These outputs can expose sensitive configuration. Compare the image digest, values, chart revision, and controller ownership with the release record. A GitOps controller may use Helm rendering without representing the deployment as a conventional directly managed Helm release.

## Upgrade through one owner

When Helm directly owns the release and the change is approved, an explicit upgrade can wait for platform readiness.

```bash
helm upgrade --install orders ./charts/orders \
  --kube-context staging-cluster --namespace orders \
  -f staging-values.yaml --wait --timeout 5m
```

This changes cluster resources. Readiness waiting is not a business-flow test, and the example does not request automatic rollback. In GitOps, commit the intended source change and let its controller apply it instead. Avoid `--reuse-values` as an unexamined default because stale values can outlive chart defaults.

## Recover a compatible revision

Inspect history and the earlier values before choosing a revision.

```bash
helm get values orders --revision REVISION --all --kube-context staging-cluster -n orders
helm rollback orders REVISION --kube-context staging-cluster -n orders --wait --timeout 5m
```

Replace `REVISION` with a verified numeric revision. Rollback changes resources but does not undo external side effects, database migrations, or incompatible data writes. A GitOps owner may immediately restore its declared source; coordinate recovery through that owner.
