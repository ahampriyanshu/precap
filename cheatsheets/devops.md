# DevOps commands and workflows

Use this beside the DevOps recap or jump to the task at hand. Commands assume a Linux host where relevant, Bash, and installed/authenticated versions of the named tools. Identifiers, resource names, certificate paths, and repository paths are examples to replace. Each workflow states its additional prerequisites and how to interpret the result.

Inspection comes before changes. Blocks that install a service, reload a proxy, apply infrastructure, backfill data, deploy, roll back, or restore a database change their stated target. Run them in the environment you have selected deliberately.

## Deployment context

Set the example identifiers for your environment. `APP_HOST` is the public hostname; `APP_SERVICE` is the systemd unit. Later Kubernetes examples use Deployment and Service `api`, Helm release `precap`, and label `app=api`.

```bash
export APP_HOST='api.example.com'
export APP_SERVICE='precap-api'
export AWS_PROFILE='precap-staging'
export AWS_REGION='ap-south-1'
export KUBE_CONTEXT='precap-staging'
export NAMESPACE='precap'
```

Before a cloud or cluster operation, inspect who and where you are. The Kubernetes context and namespace must already exist; these commands do not create them.

```bash
aws sts get-caller-identity
kubectl config get-contexts
kubectl --context "$KUBE_CONTEXT" get namespace "$NAMESPACE"
git rev-parse HEAD
git status --short
```

Confirm the AWS account and principal, the selected cluster, and the revision you intend to release. A clean local tree alone does not identify the artifact deployed in that environment. Later commands keep context and namespace explicit rather than changing the global kubectl context.

[Context: start with a deployment contract](/guides/engineering/devops/#start-with-a-deployment-contract)

## Host and process

On the Linux API host, start with process, listener, and resource evidence:

```bash
systemctl status "$APP_SERVICE" --no-pager
journalctl -u "$APP_SERVICE" --since '15 minutes ago' --no-pager
sudo ss -ltnp 'sport = :8000'
curl --fail --max-time 3 http://127.0.0.1:8000/api/health/ready
free -h
df -h
```

An active unit with no listener suggests startup or binding trouble. A healthy local response with a failing public request moves the investigation toward ingress. Logs identify application exits; disk and memory evidence help distinguish those from resource exhaustion.

For a new host deployment, save this as `precap-api.service`. It assumes the service account, application virtual environment, release path, and private environment file have already been provisioned. The API handles termination and binds to loopback.

```ini
[Unit]
Description=precap API
Wants=network-online.target
After=network-online.target

[Service]
Type=exec
User=precap
WorkingDirectory=/srv/precap/current
EnvironmentFile=/etc/precap/api.env
ExecStart=/srv/precap/current/.venv/bin/python -m app
Restart=on-failure
RestartSec=3
TimeoutStopSec=40

[Install]
WantedBy=multi-user.target
```

Install and start the unit after reviewing those inputs:

```bash
sudo install -m 0644 precap-api.service /etc/systemd/system/precap-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now "$APP_SERVICE"
systemctl status "$APP_SERVICE" --no-pager
```

`daemon-reload` rereads unit definitions; it does not restart an already running application. A later release needs an intentional restart or replacement. Restart loops can hide a persistent configuration error; inspect the cause before raising retry limits.

[Context: make the process survive the terminal](/guides/engineering/devops/#make-the-process-survive-the-terminal)

## DNS, TLS, and ingress

Separate name resolution, certificate validation, and HTTP behavior:

```bash
dig +short "$APP_HOST"
openssl s_client -connect "$APP_HOST:443" -servername "$APP_HOST" \
  -verify_hostname "$APP_HOST" -verify_return_error </dev/null
curl --fail --show-error --max-time 5 "https://$APP_HOST/api/health/ready"
```

Adjust the last URL to the API's real public health route. Check the resolved address, certificate verification result and validity window, then HTTP status. Do not use `curl -k` as evidence that TLS is correct. A TLS success with HTTP 502 points past the certificate toward routing or upstream health.

This Nginx server fragment assumes `/srv/web` contains the frontend, the certificate files exist, and the backend serves `/api/` paths. Place it inside the host's `http` configuration through its existing include convention.

```nginx
server {
    listen 443 ssl;
    server_name api.example.com;
    ssl_certificate /etc/tls/fullchain.pem;
    ssl_certificate_key /etc/tls/private.key;
    root /srv/web;
    location / { try_files $uri /index.html; }
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

The upstream has no URI suffix, preserving `/api/`. Configure the backend to trust forwarded headers only from the proxy. Set application-specific upload, timeout, logging, and certificate-renewal policy alongside this fragment. Then validate before changing the live proxy:

```bash
sudo nginx -t
sudo systemctl reload nginx
curl --fail --max-time 5 "https://$APP_HOST/api/health/ready"
```

A configuration test checks syntax and referenced files; it does not prove upstream reachability. Reload only after that check succeeds. [Nginx documents `proxy_pass` path behavior](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass).

[Context: put DNS and TLS at the public boundary](/guides/engineering/devops/#put-dns-and-tls-at-the-public-boundary)

## Images and artifacts

From the application repository, use its reviewed Dockerfile and a registry identity with push access. Set `BASE_IMAGE` to an approved Python image pinned by digest, and replace `IMAGE` with the candidate repository. Buildx publishes once and writes the pushed manifest digest to metadata:

```bash
IMAGE='registry.example.com/team/precap-api'
REV=$(git rev-parse HEAD)
: "${BASE_IMAGE:?Set the approved digest-pinned Python base image}"
docker buildx build --build-arg "BASE_IMAGE=$BASE_IMAGE" \
  --tag "$IMAGE:$REV" --push --metadata-file build-metadata.json .
DIGEST=$(python3 -c 'import json; print(json.load(open("build-metadata.json"))["containerimage.digest"])')
docker pull "$IMAGE@$DIGEST"
```

This requires registry authentication and Buildx support. The digest identifies the pushed artifact; a source-revision tag is still a mutable registry name unless the registry enforces immutability. [Buildx documents its metadata fields](https://docs.docker.com/reference/cli/docker/buildx/build/#metadata-file).

For an isolated staging smoke test, `staging.env` supplies approved staging configuration and is excluded from Git. Keep this container name free and run the readiness check after its expected startup interval:

```bash
docker run --detach --name precap-candidate --env-file staging.env \
  --publish 127.0.0.1:18000:8000 "$IMAGE@$DIGEST"
docker logs --tail 100 precap-candidate
curl --fail --max-time 3 http://127.0.0.1:18000/api/health/ready
docker stop --time 40 precap-candidate
docker rm precap-candidate
```

A pipeline should poll readiness with a deadline, run a real dependency-backed request, and clean up on success or failure. Listening on `0.0.0.0:8000` inside the container is compatible with a loopback-only host publication. `EXPOSE` in a Dockerfile would not publish a host port by itself.

[Context: turn the release into an immutable artifact](/guides/engineering/devops/#turn-the-release-into-an-immutable-artifact)

## CI and promotion

A Jenkins pipeline can establish early verification gates before artifact promotion. This complete declarative skeleton assumes a trusted agent with the project's Python dependencies and Helm installed, plus an existing chart and staging values file:

```groovy
pipeline {
  agent { label 'trusted-builder' }
  options {
    disableConcurrentBuilds()
    timeout(time: 20, unit: 'MINUTES')
  }
  stages {
    stage('Verify source') {
      steps { sh 'python -m unittest discover -s tests' }
    }
    stage('Validate release manifests') {
      steps {
        sh 'helm lint ./deploy/precap -f ./deploy/staging.yaml'
        sh 'helm template precap ./deploy/precap -f ./deploy/staging.yaml > rendered.yaml'
      }
    }
  }
}
```

The remaining release stages use the artifact workflow above, smoke-test the exact published digest, and promote that digest with a reviewed configuration revision. This skeleton deliberately shows the gates, not a universal deploy command. `disableConcurrentBuilds` serializes one Jenkins job; releases from different jobs need a shared environment lock or one deployment owner.

Do not make the production stage rebuild the image from the same tag. Record the digest, source revision, and configuration revision together. Restrict untrusted branch execution to agents and credentials that cannot alter production. Rendered manifests may contain secrets and need controlled retention. [Jenkins describes concurrency and pipeline options](https://www.jenkins.io/doc/book/pipeline/syntax/#options).

[Context: automate verification and promotion](/guides/engineering/devops/#automate-verification-and-promotion)

## Schema and data migrations

Use a configured libpq service named `precap-staging`; its identity and credentials are maintained outside the command. Inspect long-running transactions and lock waits before a schema change:

```bash
psql 'service=precap-staging' -X -v ON_ERROR_STOP=1 -c \
"SELECT pid, now() - xact_start AS age, wait_event_type, wait_event
 FROM pg_stat_activity
 WHERE datname = current_database() AND xact_start IS NOT NULL
 ORDER BY xact_start;"
```

Activity details depend on the database role's visibility. A waiting migration can queue behind an old transaction even when the alteration itself is fast. Use the migration system's lock timeout and one execution owner.

After the additive `display_name` migration and compatible write path are deployed, one backfill batch can be:

```sql
WITH batch AS (
  SELECT id FROM users
  WHERE display_name IS NULL AND full_name IS NOT NULL
  ORDER BY id
  LIMIT 1000
  FOR UPDATE SKIP LOCKED
)
UPDATE users u SET display_name = u.full_name
FROM batch b
WHERE u.id = b.id AND u.display_name IS NULL;
```

Run each batch in a short transaction, observe its row count and replication lag, and throttle against measured load. The schema assumes a primary key `id`. Compatibility must preserve concurrent name edits; a backfill cannot repair an old writer that continues updating only `full_name`. A zero-row batch with `SKIP LOCKED` does not establish global completion while other transactions hold candidates. Verify the remaining population separately before switching reads and later dropping the old field.

[Context: change data without breaking the previous release](/guides/engineering/devops/#change-data-without-breaking-the-previous-release)

## Terraform and state

From the infrastructure repository and intended root module, use its configured remote backend and locked provider versions. Read the proposed changes before applying them:

```bash
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan -out=tfplan
terraform show -no-color tfplan
```

Review account, region, replacements, deletions, permissions, and estimated blast radius. The saved plan contains sensitive values; keep it out of Git and retain it only under the team's artifact policy. Apply the reviewed plan through the authorized execution path:

```bash
terraform apply tfplan
terraform plan -detailed-exitcode
```

For the final command, exit `0` means no proposed changes, `2` means changes exist, and `1` means an error. Investigate unexpected drift rather than repeatedly applying it away. A state-lock error calls for identifying the owner or failed run; `force-unlock` is not a routine retry command. Native S3 lock-file support requires a compatible Terraform version and bucket permissions; [HashiCorp documents that setup](https://developer.hashicorp.com/terraform/language/backend/s3).

[Context: declare infrastructure and protect its state](/guides/engineering/devops/#declare-infrastructure-and-protect-its-state)

## Capacity and bottlenecks

On the host, distinguish CPU, memory, disk, and established connections before adding workers:

```bash
uptime
vmstat 1 5
df -h
sudo ss -s
```

Load average is not a CPU-utilization percentage; blocked tasks can contribute. Inspect application latency and dependency time alongside these signals. For PostgreSQL, compare connection demand with the configured limit:

```bash
psql 'service=precap-staging' -X -v ON_ERROR_STOP=1 -c \
"SELECT state, count(*) FROM pg_stat_activity
 WHERE datname = current_database() GROUP BY state;"
psql 'service=precap-staging' -X -c 'SHOW max_connections;'
```

This sees current connections, not the configured potential demand of every application pool. Budget `replicas × processes × pool limit`, including overflow and background jobs. Confirm queue age and completion rate after a capacity change; draining work faster than it arrives is the useful outcome. Increasing API replicas while the database is already saturated can make recovery slower.

[Context: scale the constrained resource](/guides/engineering/devops/#scale-the-constrained-resource)

## Scheduler and service discovery

If the service uses ECS, inspect desired, running, and pending tasks plus recent scheduler events. The example cluster and service must exist in the selected AWS environment:

```bash
aws ecs describe-services --cluster precap-staging --services api \
  --query 'services[].{desired:desiredCount,running:runningCount,pending:pendingCount,events:events[:3].message}'
```

For the Kubernetes path, follow the controller down to running Pods and ready Service backends:

```bash
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" get deploy,rs,pods -l app=api
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" describe deployment api
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" get service api -o yaml
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" get endpointslices \
  -l kubernetes.io/service-name=api -o yaml
```

The Deployment selector, Pod labels, Service selector, and target port must agree. In EndpointSlices, inspect endpoint conditions rather than counting addresses; an endpoint can be present without being ready. Pending Pods lead toward capacity, scheduling constraints, quotas, or volumes. Running but unready Pods lead toward startup, probes, or application dependencies.

To check a selected backend while bypassing public ingress and Service ClusterIP networking, use port forwarding. This example assumes Service port `80` maps to `targetPort: 8000`; substitute the inspected Service port when yours differs. Run this in one terminal and curl it from another:

```bash
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" port-forward service/api 18000:80
```

Use `curl --fail http://127.0.0.1:18000/api/health/ready` in the second terminal. Success verifies the selected backend through the API-server forwarding path; it does not verify Service routing, the load balancer, or ingress. [Kubernetes documents Service debugging boundaries](https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/).

[Context: choose a scheduler when fleet work becomes the constraint](/guides/engineering/devops/#choose-a-scheduler-when-fleet-work-becomes-the-constraint)

## Kubernetes and Helm

The chart and values file belong to the application repository; the namespace already exists. Render and inspect them before changing the cluster:

```bash
helm lint ./deploy/precap -f ./deploy/staging.yaml
helm template precap ./deploy/precap -n "$NAMESPACE" \
  -f ./deploy/staging.yaml > rendered.yaml
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" apply \
  --dry-run=server -f rendered.yaml
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" diff -f rendered.yaml
```

Server dry-run checks admission against the target cluster without persisting resources; it does not run the workload. `kubectl diff` exits `1` for differences and above `1` for an error, so automation must distinguish those outcomes. Control access to rendered secrets. Review image digest, selectors, requests, probes, and disruption behavior.

For a **direct Helm-owned release**, install or upgrade with the same reviewed inputs:

```bash
helm upgrade --install precap ./deploy/precap --kube-context "$KUBE_CONTEXT" \
  -n "$NAMESPACE" -f ./deploy/staging.yaml --wait --timeout 5m
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" rollout status deployment/api --timeout=180s
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" get hpa
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" top pods --containers
```

`top` needs a working metrics API; HPA behavior needs its configured metrics and suitable resource requests. A completed rollout still needs the customer-path checks. For controller-owned GitOps deployments, change the configuration through that controller's source instead of issuing a competing Helm upgrade. [Helm's wait flags](https://helm.sh/docs/helm/helm_upgrade/) govern resource checks rather than business correctness.

[Context: make Kubernetes and Helm express application behavior](/guides/engineering/devops/#make-kubernetes-and-helm-express-application-behavior)

## Identity, config, and secrets

Inspect the caller and workload identity before treating every denial as a networking failure:

```bash
aws sts get-caller-identity
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" get serviceaccount api -o yaml
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" auth can-i get secrets
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" auth can-i create deployments
aws secretsmanager describe-secret --secret-id precap/staging/api \
  --query '{name:Name,rotated:LastRotatedDate,changed:LastChangedDate}'
```

The kubectl authorization checks describe your current identity. Checking a ServiceAccount with impersonation requires separate impersonation permission; it is not implied by read access. AWS workload identity must be configured through the chosen integration, and the human caller's role does not prove the Pod's cloud permissions.

`describe-secret` inspects metadata without requesting the secret value. Use the application deployment's config and secret references to verify wiring; avoid dumping Secret YAML or decoded values into an incident transcript. After rotation, verify new application connections succeed and retire the old credential through the defined overlap policy. Restarting every Pod without checking dependency capacity can turn rotation into an outage.

[Context: separate configuration from authority](/guides/engineering/devops/#separate-configuration-from-authority)

## Release and rollback

Identify the running artifact and release history before changing it. The example chart uses container name `api`:

```bash
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" get deployment api \
  -o jsonpath='{.spec.template.spec.containers[?(@.name=="api")].image}{"\n"}'
helm history precap --kube-context "$KUBE_CONTEXT" -n "$NAMESPACE"
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" rollout history deployment/api
```

For a **direct Helm-owned release**, choose a known compatible Helm revision after checking migration and external-effect compatibility. Set `GOOD_REVISION` from the inspected history:

```bash
helm rollback precap "$GOOD_REVISION" --kube-context "$KUBE_CONTEXT" \
  -n "$NAMESPACE" --wait --timeout 5m
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" rollout status deployment/api --timeout=180s
curl --fail --max-time 5 "https://$APP_HOST/api/health/ready"
```

For **GitOps-owned resources**, inspect the controller, then submit the corrective configuration commit through its normal review path. These commands assume an authenticated Argo CD CLI and existing Application `precap-staging`:

```bash
argocd app get precap-staging
argocd app diff precap-staging
argocd app wait precap-staging --sync --health --timeout 180
```

`argocd app diff` can return a difference exit code. A live `kubectl rollout undo` is not a durable GitOps rollback when reconciliation restores the newer configuration. After either path, test authentication and a real read/write journey, then reconcile accepted work and ambiguous provider operations. Healthy resource status alone is insufficient.

[Context: give releases one owner and verify the journey](/guides/engineering/devops/#give-releases-one-owner-and-verify-the-journey)

## Incidents, recovery, and cost

Capture a short timeline before changing the service. These read-only commands provide cluster events and a bounded slice of API logs; labels and namespace must select only the intended workload:

```bash
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" get events \
  --sort-by=.metadata.creationTimestamp
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" logs -l app=api \
  --all-containers=true --prefix=true --tail=100 --since=15m --max-log-requests=10
kubectl --context "$KUBE_CONTEXT" -n "$NAMESPACE" get pods -l app=api -o wide
```

Correlate this with release time, dependency errors, latency, and accepted-work age. Use the central logging system for larger fleets; selected Pod logs are not a complete incident record. Redact sensitive payloads before sharing diagnostics.

A **logical PostgreSQL restore rehearsal** can use an approved dump and a separately provisioned, isolated empty target. `precap-restore` must name that target, with the required roles/extensions and no production consumers:

```bash
pg_restore --list backup.dump
pg_restore --dbname='service=precap-restore' --no-owner --exit-on-error backup.dump
psql 'service=precap-restore' -X -v ON_ERROR_STOP=1 -c \
'SELECT count(*) AS users_after_restore FROM users;'
```

Inspect the dump inventory first, then verify application-level invariants and measure elapsed recovery time. A row count alone does not prove integrity. Logical dumps do not establish point-in-time recovery or restore cluster-wide roles; test the actual backup/WAL strategy and recovery objective separately. [PostgreSQL documents restore scope](https://www.postgresql.org/docs/current/app-pgrestore.html).

For cost investigation, start with an explicit billing interval and service breakdown. This AWS Cost Explorer request needs billing access; the end date is exclusive:

```bash
aws ce get-cost-and-usage --region us-east-1 \
  --time-period Start=2026-10-01,End=2026-10-08 \
  --granularity DAILY --metrics UnblendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

Connect changes to traffic, useful completions, egress, storage retention, and reserved capacity before reducing reliability headroom. Shared-service costs need an attribution policy. The useful conclusion is which operational promise or workload drives spend, and whether that promise still fits the product.

[Context: operate recovery and cost as product promises](/guides/engineering/devops/#operate-recovery-and-cost-as-product-promises)
