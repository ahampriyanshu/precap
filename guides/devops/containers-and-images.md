# Containers and image builds

Installing dependencies directly on long-lived hosts creates differences between machines and releases. Containers package a filesystem and a process contract, while the runtime supplies isolation and resource controls. Docker made image construction and distribution accessible; the underlying isolation is provided by the operating system. A container shares a kernel with its host and has different isolation properties from a virtual machine.

## Separate image, container, and volume

An image is a content-addressed set of filesystem layers and configuration. A container is a running or stopped instance with a writable layer, namespaces, and resource constraints. A volume persists separately from that writable layer. Deleting a container should be safe for a stateless service; deleting the only volume containing customer state is data loss.

Namespaces isolate views of resources such as processes and networking. Control groups account for and limit CPU and memory. Capability reduction, user IDs, seccomp, and filesystem restrictions narrow privileges. A root process in a privileged container with the host Docker socket can cross boundaries that an ordinary application container should never receive.

A container's `localhost` refers to its own network namespace in ordinary bridge networking. Publishing a port forwards host traffic to the container. Service discovery between containers uses their configured network names; it does not make the host's loopback listener magically available inside each container.

## Build dependencies and runtime dependencies differ

Compilers and package download credentials are build concerns. A runtime image should carry what the service needs to execute. This illustrative Python Dockerfile expects a hash-pinned `requirements.txt` and an `app.py` compatible with the installed server.

```dockerfile
FROM python:3.12-slim AS build
WORKDIR /build
COPY requirements.txt .
RUN python -m venv /venv
RUN /venv/bin/pip install --require-hashes -r requirements.txt

FROM python:3.12-slim AS runtime
RUN useradd --uid 10001 --create-home app
COPY --from=build /venv /venv
WORKDIR /app
COPY --chown=10001:10001 app.py .
USER 10001
ENV PATH="/venv/bin:$PATH" PYTHONUNBUFFERED=1
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

The two stages need ABI-compatible runtime libraries; packages with native extensions may require explicit system libraries. The visible base tags are readable examples. Production builds should resolve approved base digests and record them, then rebuild deliberately when a base or dependency needs updating. A digest identifies content; it does not make that content secure forever.

Copy lockfiles before frequently changing source to reuse dependency layers. Use `.dockerignore` to exclude `.git`, secrets, caches, local environments, and unrelated files from the build context. Build cache correctness and final image size are separate concerns: a cached secret-containing layer is still a secret leak.

## Pass secrets at the right phase

Runtime credentials should arrive through the runtime's secret or workload identity mechanism. Build credentials should use temporary build secret mounts. `ARG` and `ENV` are inappropriate for secrets that must not persist in image metadata or layers. Deleting a copied credential in a later layer does not remove it from earlier layers.

Prefer short-lived cloud credentials for the workload over a static access key. Scope the credential to the service's required operations and resources. Rotation has an application lifecycle too: a process that reads a file only at startup will keep the old credential until it reloads or restarts.

## Resource limits change failure behavior

A CPU limit can throttle a busy process even on a host with visible idle CPU. A memory limit can trigger an OOM kill instead of graceful application-level rejection. Measure resident memory under realistic concurrency, account for native allocations, and keep headroom for runtime overhead.

Docker's exec-form command lets the server receive termination signals directly. A shell wrapper needs to forward signals or replace itself with `exec`. Multi-process containers need a deliberate child-reaping strategy; an init process can handle zombies but cannot invent application draining semantics.

| Observation | Possible mechanism | Useful next evidence |
| --- | --- | --- |
| Works locally, fails in image | Missing library, path, permissions | Exact command and image filesystem |
| Increasing latency under load | CPU throttling or dependency wait | cgroup metrics and request timings |
| Exit code 137 | Process killed, often memory pressure | OOM state and host/runtime events |
| Cannot reach sibling service | Network namespace or DNS boundary | Container network and listener |
| Old behavior after pull | Mutable tag or unreplaced container | Running image digest |

An exit code alone is a clue rather than a diagnosis. Correlate it with runtime events and the resource limits in effect.

## When containers help—and what remains

Images improve artifact portability and repeatable replacement. They do not provide TLS, database backups, multi-host scheduling, workload identity, or customer-path monitoring by themselves. Docker Compose can coordinate a useful local or small-host stack; an orchestrator adds continuous reconciliation across hosts when that operating problem is justified.

Use the [Docker cheatsheet](/cheatsheets/docker/) for image inspection, local diagnosis, Compose flows, and digest-based distribution.
