# Browser security and trust boundaries

The web allows a page to load content and initiate requests across many origins. Browser security mechanisms evolved to contain that power while preserving links, images, forms, and shared services. Application security depends on understanding exactly which mechanism restricts which action.

Every byte sent to the browser is available to its user. Hidden controls, minified bundles, route guards, and environment variable names cannot establish authorization or secrecy.

## Origins, sites, and CORS answer different questions

An origin is defined by scheme, host, and port. The same-origin policy restricts how one origin reads or interacts with another. A site is a different concept used by cookie policies and related mechanisms; two subdomains can be same-site while remaining cross-origin.

CORS lets a server permit particular browser origins to read responses. It is not authentication, and it does not prevent every cross-origin request from being sent. Some requests proceed without a preflight; non-browser clients do not enforce browser CORS policy.

```http
Access-Control-Allow-Origin: https://app.example.test
Access-Control-Allow-Credentials: true
Vary: Origin
```

These are illustrative server response headers for one explicitly trusted origin. Credentialed access cannot use a wildcard allowed origin. Reflecting any requesting origin while allowing credentials defeats the intended trust decision. Server authorization is required regardless of CORS.

## XSS turns content into application authority

Cross-site scripting occurs when untrusted content becomes executable markup or script in the application's origin. An attacker then operates within the victim's page context. Output handling must match the sink: HTML text, an attribute, a URL, CSS, and a script context have different rules.

For plain text, use a text sink:

```javascript
const value = '<img src=x onerror="alert(1)">';
const label = document.createElement("span");
label.textContent = value;
console.log(label.children.length); // 0
```

Framework text interpolation usually provides escaping, but escape hatches that insert HTML bypass that protection. Rich HTML requires an appropriate maintained sanitizer with a controlled policy. Do not build a sanitizer by removing `<script>` strings; executable behavior has many representations.

URL destinations need a separate policy. A safe text label does not make a `javascript:` navigation safe. Parse URLs, restrict protocols and destinations for the action, and distinguish external navigation from trusted internal routes.

## Content Security Policy is a defense layer

A strict CSP can restrict script execution and resource destinations. A server can issue a fresh nonce on each response and apply it only to authorized scripts. The following is a policy template, not a literal nonce to reuse:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-RESPONSE_NONCE'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
```

The server must generate and substitute an unpredictable nonce and attach it to the intended script elements. Adapt the policy to actual asset and API needs. Start with reporting to understand violations where necessary, then enforce. Adding broad exceptions such as unrestricted inline script can erase much of the benefit.

CSP does not replace correct encoding, sanitization, or authorization. Trusted Types can help constrain dangerous DOM sinks in supported browsers, but adoption needs a deliberate policy rather than a wrapper that approves every string.

## Sessions and CSRF need an explicit design

An HTTP-only cookie prevents ordinary page script from reading that cookie; an XSS payload can still initiate authenticated operations. Secure restricts cookie transmission to secure contexts; SameSite constrains some cross-site sending behavior. A host-scoped session cookie can use the `__Host-` prefix with its required attributes:

```http
Set-Cookie: __Host-session=opaque-value; Path=/; Secure; HttpOnly; SameSite=Lax
```

That example omits a Domain attribute as required by the prefix. Choose expiry and rotation policies for the application. SameSite is useful defense but not a universal CSRF solution: same-site attacker-controlled contexts, browser behaviors, and required cross-site flows complicate the boundary.

Use an appropriate CSRF token and/or strict origin verification strategy for state-changing cookie-authenticated operations. Do not use GET for mutations. Recheck authorization on every resource and operation; possessing a valid session is not permission to edit every record.

Bearer tokens stored in JavaScript-accessible storage are exposed to XSS. Moving a token from local storage to memory changes persistence, not the authority an active injected script can exercise. Evaluate session architecture around the full attack model rather than one storage slogan.

## Private data can leak through delivery paths

Inspect server-rendered props, HTML source, component payloads, logs, analytics, source maps, and cached responses. A component may display only a name while its serialized input includes an entire private profile. A shared cache keyed too broadly can leak data without any XSS.

After logout or tenant switch, clear identity-scoped client caches and persisted drafts according to policy. Cross-tab session changes may need coordination. Avoid putting access tokens, sensitive searches, or personal records in URLs, which can enter history and telemetry.

Browser storage can be evicted and is not a secure database. Encrypting data with a key shipped alongside it does not protect it from code executing in the same page context.

## Third-party code and embedded content expand authority

An analytics or chat script running in the page can often inspect the DOM and initiate requests with the page's capabilities. Review necessity, destinations, version control, and loading policy. Subresource integrity can pin eligible static cross-origin resources, but it does not protect a script that intentionally sends private data.

Use sandboxed iframes where an isolated embedded application is appropriate, and grant only the necessary capabilities. Validate `postMessage` sender origin, source, and message schema. Do not accept an attacker-supplied origin from the message itself as proof of identity.

## Review the actual authority path

For a feature, list inputs, sensitive outputs, privileged actions, and the server checks authorizing them. Trace an untrusted title into its rendering sink, an authenticated write through CSRF and authorization, and a tenant switch through every cache.

Test expected policy failures deliberately: blocked origins, expired sessions, invalid tokens, unauthorized object IDs, and malicious rich content. A secure frontend makes server-enforced decisions visible and recoverable without pretending that the browser is the authority.
