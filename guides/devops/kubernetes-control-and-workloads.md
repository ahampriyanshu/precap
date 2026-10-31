# Kubernetes reconciliation and workloads

Once a fleet must place containers, replace failed instances, roll out changes, and expose stable service addresses, manual host scripts become a distributed coordination system. Kubernetes provides an API for desired state and controllers that keep moving observed state toward it. The mechanism is reconciliation: repeated observation and corrective action under partial failure.

## Follow the control loop

The API server validates and stores object changes. Controllers watch resources and act on differences. The scheduler selects a node for an unscheduled Pod based on constraints and available requested capacity. The kubelet on that node works with the container runtime to start and monitor containers. Networking and storage plugins provide additional interfaces; they are significant operational dependencies.

A Deployment owns ReplicaSets; ReplicaSets maintain the intended number of matching Pods. Deleting a Deployment-managed Pod normally causes replacement. It does not change the Deployment's desired replica count. This is why an imperative emergency edit can be reversed by a controller or GitOps reconciler.

![A Deployment controller creates a ReplicaSet, a ReplicaSet creates Pods, a scheduler assigns nodes, and kubelets start containers while status returns through the API.](/diagrams/devops-reconcile.svg)

Controllers must tolerate retries and stale observations. A successful API update means the desired object was accepted, not that every side effect completed. Inspect object status, conditions, generation, and events to understand progress.

## Workload types express different lifecycles

A Deployment suits replaceable instances. A StatefulSet provides stable Pod identities and ordered lifecycle mechanisms useful to some stateful systems; it does not implement database replication or backup. A DaemonSet places node-associated agents. A Job represents work with completion and retry semantics; a CronJob schedules Jobs and needs explicit overlap and missed-schedule policies.

A Pod is the scheduling unit. Containers in a Pod share networking and can share volumes, which is useful for tightly coupled sidecars. Unrelated services in one Pod must scale and fail together. Containers that merely happen to be written by the same team do not need that coupling.

## Requests drive placement; limits shape execution

This Deployment fragment sets a measured starting budget and rolling-update policy. The image name is illustrative; publish and reference a real tested digest for deployment.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders
spec:
  replicas: 3
  strategy:
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels: {app: orders}
  template:
    metadata:
      labels: {app: orders}
    spec:
      terminationGracePeriodSeconds: 40
      containers:
        - name: api
          image: registry.example.test/orders:release-42
          ports: [{name: http, containerPort: 8000}]
          resources:
            requests: {cpu: 500m, memory: 512Mi}
            limits: {cpu: '2', memory: 1Gi}
```

Requests influence scheduling and CPU allocation under contention. CPU limits can throttle; memory limit enforcement can kill a process. A low memory request with a high possible working set risks node pressure when many Pods grow together. Measure steady and peak usage, allocation spikes, startup behavior, and throttling rather than copying these numbers.

Three replicas requesting half a CPU each reserve 1.5 CPUs of scheduling budget, before sidecars and overhead. A surge rollout needs additional room. A Pending replacement can mean the workload exceeds allocatable resources or violates placement constraints, even if aggregate dashboard utilization looks low.

## Placement establishes failure tolerance

Use topology spread or anti-affinity to distribute replicas across intended failure domains. Hard constraints can prevent scheduling when a zone is unavailable; soft preferences may concentrate workloads. Decide which behavior is acceptable before relying on “three replicas” as evidence of availability.

A PodDisruptionBudget limits eligible voluntary disruptions according to its policy. It does not prevent a machine crash, guarantee capacity, or replace Deployment rollout settings. A strict budget plus no spare capacity can block maintenance. Rehearse node drains and zone loss while watching actual customer success.

## Configuration, storage, and identity are separate resources

ConfigMaps distribute ordinary configuration. Secrets hold secret data but base64 encoding is not encryption. Establish encryption at rest and access control for the cluster datastore, and limit who may read or exec into workloads with access to credentials. Mounted configuration updates and environment-variable updates have different propagation behavior; applications may need explicit reload or restart.

PersistentVolumeClaims request storage according to a storage class. Access modes, zone binding, snapshot capability, and reclaim policy affect replacement and data retention. A successful Pod reschedule is insufficient if the volume cannot attach in the new zone. Data recovery needs an application-consistent backup strategy as well as storage mechanisms.

Give each workload a scoped service account and cloud identity where supported. Avoid automatically mounting API tokens in applications that do not need the Kubernetes API. RBAC limits API actions; network policy and container isolation address different boundaries.

## Diagnose intent before changing symptoms

For Pending, inspect scheduling events and constraints. For ImagePullBackOff, inspect image reference, registry access, and network reachability. For CrashLoopBackOff, inspect previous container logs and termination reason. For Running but unavailable, inspect readiness and the Service path. These states identify stages of the lifecycle, not root causes by themselves.

The [Kubernetes cheatsheet](/cheatsheets/kubernetes/) keeps that command sequence separate from the control model. Operate a cluster only with clear ownership for API availability, datastore recovery, node upgrades, networking, storage, and policy; a managed control plane reduces part of that work.
