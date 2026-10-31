# Identity, authorization, and tenant isolation

Authentication answers who presented a credential. Authorization decides what that identity may do to a particular resource. Tenant isolation extends that decision across every storage path, cache, job, export, and administrative tool. These concerns became more complex as applications moved from one trusted machine to browsers, federated identities, services, and shared multitenant infrastructure.

Treat identity as verified context, permission as a current decision, and tenant scope as a boundary that must survive the entire operation.

## Credentials establish a limited claim

A session cookie usually points to server-managed session state; a signed token carries verifiable claims. Both need expiration, rotation, revocation policy, and secure transport. A token is not confidential merely because it is signed. Avoid putting secrets or unnecessary personal data into its payload.

Token validation must constrain accepted algorithms and verify signature, issuer, audience, and time claims using a trusted key configuration. Decoding JSON is not validation. A service token issued for one audience should not grant access to a different service because both share a signing key.

```text
untrusted request
  → verify credential and its intended audience
  → resolve active principal and permitted tenant membership
  → authorize action on resource in that tenant
  → execute a scoped operation
```

Short-lived credentials reduce exposure but do not make permission changes instantaneous. Decide whether sensitive actions need a live membership check, a revocation version, or another bounded-staleness policy. Authentication can remain valid after access to an organization has been removed.

## Sessions, OAuth, and service identities

A browser session needs an unpredictable identifier, rotation after authentication or privilege changes, and explicit expiry. The session store makes revocation straightforward but becomes part of request availability. Cookie attributes constrain how the browser exposes and sends the identifier; they do not prevent an attacker from using an already stolen active session.

OAuth delegates access to a resource; OpenID Connect adds an identity layer used for sign-in. Do not treat an arbitrary OAuth access token as proof of a user's identity to your application. In a typical browser sign-in flow, an authorization-code exchange with PKCE binds the code to the initiating client, while the application validates the redirect flow and identity response.

```text
Browser starts sign-in with a transaction-specific state and PKCE challenge
Identity provider redirects an authorization code to an allowed redirect URI
Application exchanges the code with the matching verifier
Application validates the identity response, including issuer and audience
Application creates its own bounded session and resolves local membership
```

This is a protocol sketch, not a complete authentication implementation. Use a maintained library with the correct state, nonce, redirect, and token checks for the chosen flow. Refresh-token rotation needs replay detection and a recovery policy; silently accepting reuse defeats its purpose. Key rotation must allow intended overlap while refusing an unknown issuer or an attacker-selected key location.

Service-to-service identity names a workload rather than a human. Short-lived workload credentials, scoped audiences, and mutual TLS can establish that boundary; a shared permanent API key copied across services makes rotation and attribution difficult. Authorize the workload's action as well as validating its credential. When a service acts for a user, preserve a verifiable delegation model instead of trusting an arbitrary `user_id` header.

If passwords are owned locally, use a reviewed password-hashing implementation with a unique salt and an appropriate work factor. A fast general-purpose hash such as SHA-256 alone is unsuitable for stored passwords. Rate-limit authentication and recovery attempts without creating an easy account-lockout denial of service; recovery and administrative reset are part of the same security boundary.

## Authorize the object and the action

A role alone is rarely enough. A support agent may read tickets in one workspace but must not export another workspace's customer data. Check subject, action, resource, tenant, and relevant state. Centralize policy decisions enough to avoid contradictory handlers, while ensuring each entry point actually invokes them.

This integration fragment shows the trusted values reaching a query:

```sql
SELECT id, state, total_minor, currency
FROM orders
WHERE tenant_id = $1 AND id = $2;
```

`$1` comes from validated membership context, not an unchecked request body. A missing scoped row can map to not-found without revealing another tenant's object. Writes require the same scope. Bulk endpoints must authorize every selected object or operate on a deliberately authorized set; checking only the first ID creates a predictable isolation failure.

Make scope difficult to omit in code. This runnable example models a required tenant context, although production enforcement also belongs in queries and tests:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class TenantContext:
    tenant_id: int
    actor_id: int

def cache_key(context, order_id, representation):
    return f"v3:t:{context.tenant_id}:order:{order_id}:{representation}"

assert cache_key(TenantContext(7, 11), 42, "public") != cache_key(
    TenantContext(8, 11), 42, "public"
)
```

If a representation contains user-specific permissions or fields, tenant scope alone is insufficient for its cache identity. Either cache only permission-independent data and filter afterward or include an appropriate authorization scope and invalidation policy.

## Storage isolation has several layers

A shared schema with `tenant_id` is efficient but relies on consistent scoping. Separate schemas or databases can strengthen operational isolation at the cost of migration and fleet-management complexity. No model automatically isolates queues, object storage paths, telemetry, or backups.

Composite keys can enforce tenant-safe relationships:

```sql
CREATE TABLE projects (
    tenant_id bigint NOT NULL,
    id bigint NOT NULL,
    name text NOT NULL,
    PRIMARY KEY (tenant_id, id)
);
CREATE TABLE tickets (
    tenant_id bigint NOT NULL,
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    PRIMARY KEY (tenant_id, id),
    FOREIGN KEY (tenant_id, project_id)
        REFERENCES projects (tenant_id, id)
);
```

This prevents a ticket from referencing a project in another tenant. PostgreSQL row-level security can add a database enforcement layer, but policy design, privileged roles, owner bypass, and pooled-session context still need care. Set tenant context within a transaction and reset it reliably; a previous request's session setting must not leak through a reused connection.

## Browser protections and server protections differ

CORS controls which browser origins may read certain cross-origin responses. It does not authenticate a caller, and non-browser clients can send the same request directly. Cookie-authenticated mutations need CSRF protection appropriate to the application's origin and cookie design. `SameSite`, `Secure`, and `HttpOnly` are useful controls with distinct roles, not substitutes for authorization.

User-controlled URLs create SSRF risk when the server fetches them. Restrict destinations, protocols, redirect behavior, and resolved network ranges; consider DNS rebinding and cloud metadata access. Parameterize SQL values. Allowlist dynamic identifiers or sort fields rather than interpolating arbitrary syntax. Validate archive paths, decompressed sizes, and uploaded content before downstream processing.

## Async work must carry accountable scope

A background worker does not inherit safe request context automatically. Persist the tenant, intended action, resource, and stable operation ID. Decide whether the worker rechecks current permission or executes a previously authorized durable command; exports and long-delayed actions often require a fresh check.

Administrative bypass should be explicit, narrow, audited, and separately authorized. A hidden `is_admin=True` default in a repository method makes accidental broad access too easy. Audit records should identify the human or workload actor, effective tenant, action, outcome, and elevated access reason without recording credentials.

Test the same object ID under two tenants, stale sessions after membership removal, cache reuse across permission changes, bulk requests with mixed ownership, and jobs that run after access revocation. Isolation failures frequently occur in the secondary path rather than the main detail endpoint.
