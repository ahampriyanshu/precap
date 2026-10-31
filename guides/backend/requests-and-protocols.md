# Requests, protocols, and the server boundary

A backend is a long-running program that accepts messages, enforces trusted rules, and changes durable state. The network boundary exists because the client and server have different owners, failure modes, and clocks. A request is therefore a protocol exchange, not a remote function call with ordinary local-call guarantees.

HTTP made independently deployed clients and servers interoperable through shared methods, representations, status codes, and intermediaries. RPC frameworks address a different pressure: typed service contracts and efficient repeated calls between controlled applications. Begin with those mechanisms before choosing a framework.

## Follow a request before reading the handler

A typical HTTPS request involves name resolution, a connection, encryption, an ingress decision, an application queue, and a handler. A reused connection skips some setup. A cache may answer before the application runs. HTTP semantics survive transport changes: HTTP/1.1 and HTTP/2 commonly use TCP; HTTP/3 uses QUIC.

![An HTTPS request passes through transport, ingress, admission, application work, and database waits; each boundary consumes the same deadline.](/diagrams/backend-request-path.svg)

The diagram is a latency decomposition, not a requirement to deploy every box. A small service can terminate TLS at one reverse proxy and run a single application process. What matters is knowing which component owns connection limits, request limits, authentication, cancellation, and error responses.

For one request, distinguish elapsed intervals:

```text
client time = DNS/connect/TLS + upload + server path + download
server path = ingress wait + admission wait + handler work
            + dependency waits + response serialization

Two parallel dependency calls taking 40 ms and 70 ms contribute
roughly 70 ms to their shared interval, not 110 ms.
```

A trace beginning at the handler cannot explain time spent queuing at ingress. Record upstream timing and application timing separately. Propagate request identity across trusted hops; never assume a user-supplied request ID is unique or safe to insert unescaped into logs.

## HTTP separates semantics from representation

Methods express intent; representations carry data. GET is safe and should not reserve inventory or charge a card. PUT's idempotence concerns the intended server effect of repeating the request, not identical status codes or timestamps. POST can support a deliberate idempotency contract even though POST has no general idempotence guarantee.

This exchange sketch shows a resource update guarded by a representation version:

```text
GET /api/projects/42
→ 200 OK
  ETag: "project-42-v7"
  Content-Type: application/json
  {"id":42,"name":"Billing","version":7}

PATCH /api/projects/42
If-Match: "project-42-v7"
Content-Type: application/json
{"name":"Payments"}
→ 200 OK with the new representation and ETag

A conflicting intervening write → 412 Precondition Failed
```

The server must connect `If-Match` to an atomic version check in storage. An ETag is not a lock. Choose strong validators for this use; a weak validator describes semantic equivalence and is unsuitable for `If-Match`'s strong comparison. For user-specific responses, explicitly decide cache scope. Accidentally marking an authenticated representation public can expose data through a shared intermediary.

HTTP/1.1 reuse reduces handshake cost but pipelined responses remain ordered. HTTP/2 multiplexes streams over a connection, although lost TCP data can delay all streams using that connection. HTTP/3 removes that particular cross-stream transport blocking through independent QUIC streams; application queues and congestion limits still exist. No protocol upgrade removes a slow database.

## Proxies are a trust boundary

TLS termination, host routing, body limits, and request normalization often happen before framework middleware. Establish one authoritative interpretation of request boundaries across proxies and servers. Ambiguous content length or transfer encoding interpretations can create request-smuggling vulnerabilities; patch and configure the actual stack rather than implementing a custom parser.

Treat forwarded identity and scheme headers as assertions from controlled infrastructure:

```text
Internet client
  → controlled proxy overwrites forwarded-client headers
  → application accepts those headers only from that proxy
  → direct public access to the application port is blocked

Otherwise: X-Forwarded-For: 127.0.0.1 is merely attacker input.
```

Also constrain header count, body size, decompressed size, and time allowed to upload. Reading a small compressed body can expand into a large allocation. A large timeout combined with unlimited slow uploads consumes connection capacity without much CPU.

## What an application server actually provides

A framework handler does not usually own sockets or parse TLS. A server converts protocol messages into an application interface, supervises request execution, and streams results back. Python's WSGI interface is synchronous; ASGI supports asynchronous lifecycles and additional protocols. This runnable function demonstrates only the WSGI adapter contract:

```python
import json

def application(environ, start_response):
    healthy = (environ["REQUEST_METHOD"], environ["PATH_INFO"]) == ("GET", "/health")
    body = json.dumps({"status": "ok"} if healthy else {"error": "not_found"}).encode()
    start_response("200 OK" if healthy else "404 Not Found", [
        ("Content-Type", "application/json"),
        ("Content-Length", str(len(body))),
    ])
    return [body]
```

Production servers add concurrency, lifecycle management, limits, and graceful shutdown. Each worker process has separate memory. A global dictionary does not become shared authoritative state by running four workers. Connection pools should be initialized within the correct process lifecycle, not accidentally inherited across a fork.

## When gRPC earns its place

gRPC combines an interface definition, generated client/server bindings, binary messages, metadata, deadlines, status codes, and several streaming modes. It fits controlled service boundaries where typed contracts, streaming, and consistent tooling matter. Browser-facing HTTP/JSON often remains easier to inspect, cache, and integrate directly. This Protocol Buffers definition is an integration fragment:

```text
syntax = "proto3";
package inventory.v1;

service Inventory {
  rpc Reserve(ReserveRequest) returns (ReserveReply);
}
message ReserveRequest {
  string operation_id = 1;
  string sku = 2;
  int32 quantity = 3;
}
message ReserveReply {
  string reservation_id = 1;
}
```

Field numbers are part of the wire contract. Preserve compatibility when evolving messages; reserve removed field numbers rather than reusing them for different meanings. Generated code checks shape, not business permission or a valid quantity. Both remain server responsibilities.

Set deadlines deliberately: a gRPC call can otherwise wait without an application deadline. Propagate the remaining budget to nested calls and stop work when cancellation makes it useless. Streaming flow control bounds transport delivery, but it does not bound a handler's own queue or make a blocked database faster. A streaming write accepted by a client library is also not proof that the receiving business transaction committed.

## Review the boundary, not the framework label

For a concrete endpoint, identify where bytes become trusted identity, which limits apply before allocation, how long useful work may continue, and which component can safely retry. Decide how errors cross HTTP or gRPC without leaking internals. These answers expose operational defects earlier than choosing REST versus RPC by preference.
