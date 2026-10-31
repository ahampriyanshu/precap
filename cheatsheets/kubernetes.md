# Kubernetes

A diagnostic flow from desired state to traffic. Set an explicit context and namespace for every investigation; examples use placeholders `staging-cluster` and `orders`. These commands assume appropriate read permissions and a configured kubectl client. The lessons explain [workload reconciliation](/guides/devops/kubernetes-control-and-workloads/) and [traffic transitions](/guides/devops/services-probes-and-traffic/).

## Verify the target and permissions

Read the current selection before choosing a context.

```bash
kubectl config current-context
kubectl config get-contexts
kubectl --context staging-cluster -n orders auth can-i get pods
kubectl --context staging-cluster -n orders get deploy,rs,pods -o wide
```

A namespace selects resources; it does not establish a security boundary by itself. Context names are local configuration, so verify the underlying cluster/account as needed.

## Find why a workload is not ready

Follow the intended Deployment to Pod events and the previous process instance.

```bash
kubectl --context staging-cluster -n orders describe deployment orders
kubectl --context staging-cluster -n orders get pods -l app=orders
kubectl --context staging-cluster -n orders describe pod POD_NAME
kubectl --context staging-cluster -n orders logs POD_NAME -c api --tail=100
kubectl --context staging-cluster -n orders logs POD_NAME -c api --previous --tail=100
kubectl --context staging-cluster -n orders get events --sort-by=.metadata.creationTimestamp
```

Replace `POD_NAME` with an observed Pod. `--previous` is useful after a container restart and fails when no previous instance exists. Logs and events can expire; centralized collection needs its own retention policy.

## Inspect Service and endpoint selection

Check labels, ports, and endpoint conditions before changing the ingress.

```bash
kubectl --context staging-cluster -n orders get service orders -o yaml
kubectl --context staging-cluster -n orders get pods -l app=orders --show-labels
kubectl --context staging-cluster -n orders get endpointslices \
  -l kubernetes.io/service-name=orders -o yaml
kubectl --context staging-cluster -n orders port-forward service/orders 18000:80
```

In a second terminal, query the forwarded port. Port-forward selects a backend through the API path and bypasses the ordinary Service dataplane and public ingress. It cannot prove those paths work.

## Inspect capacity and scaling

Metrics and HPA inspection distinguish a flat desired count from unscheduled requested capacity.

```bash
kubectl --context staging-cluster -n orders get hpa
kubectl --context staging-cluster -n orders describe hpa orders
kubectl --context staging-cluster -n orders top pods
kubectl --context staging-cluster get nodes
kubectl --context staging-cluster describe node NODE_NAME
```

`top` requires the metrics API. A node's allocatable budget, requested resources, taints, and topology constraints can explain Pending Pods even when average usage appears low. Replace `NODE_NAME` from the observed list.

## Preview an intended change

For a reviewed local manifest, compare and validate before applying through its owning workflow.

```bash
kubectl --context staging-cluster -n orders diff -f deployment.yaml
kubectl --context staging-cluster -n orders apply --dry-run=server -f deployment.yaml
```

Diff exits with 1 when differences exist; distinguish that from an execution failure. Dry-run invokes server validation/admission without persisting ordinary changes, subject to webhook behavior. A GitOps-owned resource should change through its source; avoid competing writes.

## Verify a release and preserve evidence

After the approved controller applies an update, inspect completion and resulting identity.

```bash
kubectl --context staging-cluster -n orders rollout status deployment/orders --timeout=120s
kubectl --context staging-cluster -n orders get deployment orders -o yaml
kubectl --context staging-cluster -n orders get pods -l app=orders \
  -o 'custom-columns=NAME:.metadata.name,IMAGE:.spec.containers[0].image,READY:.status.containerStatuses[0].ready'
```

A completed rollout still needs customer-path verification. Reverting a Deployment does not reverse database writes; choose a compatible recovery action through the same release owner.
