# DNS, TLS, and the traffic path

A service becomes reachable through several independent systems: name resolution, packet routing, a transport connection, TLS, and HTTP routing. Reverse proxies and load balancers emerged because applications needed a stable public interface while processes and machines changed behind it. Understanding the path makes a 502 or connection timeout a bounded investigation.

## Resolve a name, establish a connection

A DNS resolver answers a name-to-record question. Its cached answer can outlive a release; a low TTL does not invalidate every existing resolver entry instantly. Multiple A or AAAA records distribute possible destinations but do not themselves implement application-aware health checking.

TCP establishes reliable ordered bytes with congestion control. TLS authenticates the peer and protects those bytes in transit. HTTP then defines request and response semantics. HTTP/2 multiplexes streams over a TCP connection; connection-level packet loss can still delay multiple streams. HTTP/3 uses QUIC over UDP and changes the transport behavior, while application authorization and retries remain application concerns.

![A browser resolves DNS, establishes TLS with an ingress, and reaches a private application and database through separate routing boundaries.](/diagrams/devops-traffic.svg)

An HTTPS failure before any HTTP response suggests a different boundary from a valid HTTP 403. Browser CORS rejection is another boundary: the server may have completed the operation while JavaScript is prevented from reading its response. Follow the observed failure phase rather than mapping every symptom to “network.”

## Put a reverse proxy at the edge

A reverse proxy can terminate TLS, serve static files, route paths, enforce body limits, and maintain upstream connections. Nginx is a common implementation. This server fragment assumes certificates exist and that an HTTP listener separately redirects to HTTPS.

```nginx
server {
    listen 443 ssl;
    server_name app.example.test;
    ssl_certificate /etc/nginx/tls/fullchain.pem;
    ssl_certificate_key /etc/nginx/tls/key.pem;
    client_max_body_size 2m;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_connect_timeout 2s;
        proxy_read_timeout 25s;
    }
}
```

`proxy_pass` has no URI suffix here, so the original `/api/` path reaches the application. A URI suffix changes replacement behavior. The example overwrites forwarded client metadata at the trust boundary. If a trusted load balancer is in front, configure its trusted address ranges and real-IP handling explicitly; blindly trusting an arbitrary `X-Forwarded-For` lets a client forge identity-related metadata.

`proxy_read_timeout` measures inactivity between upstream reads, rather than a complete request deadline. A stream that periodically emits bytes may remain open much longer. Align ingress, application, dependency, and client timeout policies around a deliberate end-to-end budget.

## Separate network exposure from authorization

A public load balancer can forward to private subnets. Application instances need only accept ingress from that load balancer; a database should accept traffic from intended application identities or network sources. Network policy limits reachability. It does not establish that tenant A may access tenant B's row.

A NAT gateway provides outbound connectivity for private IPv4 resources, with recurring and traffic costs. A private service endpoint can avoid that route for supported cloud services. Diagnose whether failures affect DNS, the route table, a security group, a network ACL, or the destination itself. A subnet called “private” is a naming convention until its routes and ingress rules establish the boundary.

## Balance traffic and preserve draining

A layer-4 balancer routes connections; a layer-7 balancer understands HTTP and can route by host, path, or header. Long-lived connections can make connection counts diverge from request load. Sticky sessions simplify some designs but retain state locality and complicate rebalancing and recovery.

Health checks control backend eligibility. A check should establish that an instance can serve its class of traffic without coupling every instance's health to one transient dependency blip. Removing a backend from new traffic must precede its termination, while existing connections drain within a bounded interval.

| Symptom | First boundary to inspect | Evidence that narrows it |
| --- | --- | --- |
| Name does not resolve | DNS record and resolver | Answer, TTL, resolver used |
| TCP connection times out | Routes, firewall, listener | Address, port, SYN path |
| TLS fails | Certificate, SNI, trust, clock | Served chain and hostname |
| Proxy returns 502 | Upstream connect/protocol | Proxy error and app listener |
| Proxy returns 504 | Upstream response deadline | Upstream timings and trace |
| HTTP succeeds but browser rejects | CORS or browser policy | Request/response headers |

A successful local request to the app bypasses DNS, public TLS, and the external balancer. A successful end-to-end request exercises those layers together. Use both to isolate a broken boundary, and include the real customer path in release verification.

The [Linux and networking cheatsheet](/cheatsheets/linux-networking/) contains the diagnostic commands for this path.
