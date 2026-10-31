# Processes and the first deployment

A frontend build and an API running on a laptop do not yet form an operated service. Someone must keep the process alive, route traffic to it, provide configuration, and recover after a restart. DevOps grew around making those responsibilities repeatable while shortening the path from a code change to useful software. The first useful deployment can be a supervised process on one machine. Its limitations explain the layers that follow.

## What a running service owns

A process has an address space, file descriptors, an identity, a working directory, and an environment. Threads share its memory; separate processes communicate through sockets or other operating-system mechanisms. The kernel schedules CPU work and enforces access to memory, files, and network resources.

An API listening on port 8000 is a socket owned by a process. A listening socket proves that an address was bound; it does not prove that the application can serve a meaningful request. An HTTP server can accept a connection and then wait indefinitely for a database pool slot.

Keep four identities distinct: source revision, built artifact, configuration revision, and running process. “Version 12 is deployed” is ambiguous if half the machines have different environment variables or a mutable image tag now points elsewhere.

## Turn a terminal command into a service

Starting a process over SSH ties availability to a manual session. A supervisor starts the program on boot, records exit status, captures output, and applies a restart policy. This Linux systemd unit is an integration example; the user, paths, environment file, and installed application must exist.

```ini
[Unit]
Description=Orders API
After=network.target

[Service]
User=orders
WorkingDirectory=/srv/orders/current
EnvironmentFile=/etc/orders/runtime.env
ExecStart=/srv/orders/current/.venv/bin/python -m uvicorn app:app --host 127.0.0.1 --port 8000
Restart=on-failure
RestartSec=3
TimeoutStopSec=35
KillSignal=SIGTERM
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

The server binds to loopback because a reverse proxy is the public entry point. `After=network.target` orders startup; it does not establish that the database or DNS is usable. Dependency failures still need bounded connection attempts and an observable readiness state. Restarting a process with invalid configuration every three seconds is a loop to diagnose, rather than recovery to celebrate.

A dedicated OS user narrows access to files and credentials. Keep the application directory read-only to that user where possible, and grant write access only to explicit working directories. Treat environment files as secrets if they contain credentials; they need controlled permissions and rotation.

## Shutdown is part of the protocol

Deployments replace healthy processes too. On termination, stop accepting new work, remove readiness, drain accepted requests, close database connections, then exit before the supervisor's deadline. WebSocket sessions and queue workers need their own completion or reconnection policy. A worker should extend its lease only while it is actively processing, and acknowledge after durable completion.

Consider a request that commits an order, then loses its response during shutdown. The client cannot infer whether the commit happened. Graceful draining reduces interruptions; stable operation IDs and idempotent request semantics resolve this ambiguity. Infrastructure cannot remove the need for an application-level recovery contract.

```text
termination received
  -> stop readiness and new admissions
  -> wait for routing propagation and in-flight completion
  -> stop dependency clients and flush bounded telemetry
  -> exit before the hard kill deadline
```

The propagation and drain periods share the same termination budget. A fixed sleep is only a rough accommodation for propagation; measure actual routing behavior and long-running work. A process killed after 30 seconds cannot reliably finish a 60-second task without checkpointing or retry ownership.

## The host has finite budgets

A single VM gives the application a CPU, memory, disk, socket, and file-descriptor budget. Memory exhaustion can kill the process even if average CPU looks low. Full disks can break logging and database writes. File descriptor exhaustion may appear as failed outbound calls as well as failed incoming connections.

Diagnose the constrained resource before adding instances. For example, a database with 200 usable connections cannot support 20 instances each opening a 20-connection pool. More API capacity can worsen the dependency bottleneck. Record per-instance limits and a fleet-wide budget.

## What the first deployment teaches

One machine is reasonable for low-stakes internal tools and some modest workloads when restore and downtime expectations permit it. It has a shared failure domain, manual provisioning risk, limited rollback guarantees, and maintenance windows. The next improvements address specific constraints: a proxy establishes an ingress boundary, images package runtime dependencies, CI creates repeatable artifacts, and infrastructure definitions make replacement less dependent on memory.

Keep customer state out of a disposable release directory. Establish a persistent database, backup ownership, and a restore procedure before treating host replacement as routine. A “stateless API” still depends on stateful systems that someone operates.

Use the [Linux and networking commands](/cheatsheets/linux-networking/) when inspecting process state, sockets, disk pressure, and the route to a dependency.
