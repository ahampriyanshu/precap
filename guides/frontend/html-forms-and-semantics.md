# HTML, forms, and document contracts

HTML gives content meaning before styling or application logic exists. Its standard controls solve a coordination problem: browsers, keyboards, assistive technology, password managers, automation, and server endpoints need a shared description of what an interface does.

A clickable rectangle can resemble a button in a screenshot while failing that contract. Senior frontend work starts by preserving native behavior, then adds the interactions the product actually requires.

## Structure is an interface, not decoration

Use headings for a meaningful hierarchy, landmarks for major page regions, links for navigation, and buttons for actions. A heading does not become a heading because it has a large font. An anchor with a real destination supports new tabs, copying the link, browser previews, and navigation when scripts fail.

```html
<header>
  <a href="/">Acme</a>
  <nav aria-label="Primary">
    <a href="/orders" aria-current="page">Orders</a>
    <a href="/account">Account</a>
  </nav>
</header>
<main id="main">
  <h1>Orders</h1>
  <section aria-labelledby="recent-title">
    <h2 id="recent-title">Recent orders</h2>
    <p>You have no recent orders.</p>
  </section>
</main>
```

Document structure should survive a stylesheet failure. Avoid creating a named region for every wrapper: excessive landmarks make navigation noisier. Repeated navigation regions need distinct accessible names. A table suits genuinely tabular data; a list of cards does not become a table merely because it aligns visually.

## A form is a data and navigation protocol

Forms predate client-side routers. They collect successful named controls, encode the values, and submit a request. A GET form creates a shareable URL appropriate for searches; a POST form sends a mutation request body. Neither method itself authenticates or authorizes the operation.

```html
<form action="/orders" method="get">
  <label for="order-query">Order number or recipient</label>
  <input id="order-query" name="q" type="search" maxlength="100">
  <label for="order-status">Status</label>
  <select id="order-status" name="status">
    <option value="all">All orders</option>
    <option value="shipped">Shipped</option>
  </select>
  <button type="submit">Search orders</button>
</form>
```

The resulting query is the selected view's address. Refresh and Back retain its meaning without a second state store. Controls lacking `name` do not contribute entries. Disabled controls are not submitted; read-only controls generally remain successful. An unchecked checkbox is omitted, so the server must have a defined interpretation for absence.

Buttons inside forms default to submit behavior. Set `type="button"` on incidental actions such as opening a help panel. Otherwise an innocent UI addition can submit incomplete data.

## Validation improves feedback; the server decides acceptance

Native input types, `required`, ranges, and constraint validation prevent many accidental submissions. They cannot protect a server from altered HTTP requests. Validate again at the API boundary, including authorization and business invariants.

For server errors, connect the explanation to the affected field and preserve the entered value:

```html
<label for="recipient-email">Recipient email</label>
<input id="recipient-email" name="email" type="email"
       autocomplete="email" value="alex@example.test"
       aria-invalid="true" aria-describedby="email-error">
<p id="email-error">This address cannot receive delivery updates.</p>
```

The example describes a server rejection; it does not imply that `aria-invalid` performs validation. After submission, an error summary can provide links to invalid fields. Move focus deliberately to the summary when that helps users find multiple errors. Do not announce every keystroke or erase values after a recoverable failure.

Internationalization affects validation. Names do not reliably have a first/last pair, postal formats vary, and a technically valid email cannot establish deliverability. Constrain data according to the operation, not a culturally narrow regular expression.

## Progressive enhancement keeps the baseline useful

A server-backed form can be enhanced with asynchronous submission while retaining its HTML contract. The enhancement should activate only after the handler is ready and must render pending, success, and rejected outcomes. Here is the serialization boundary of such a browser integration:

```javascript
const form = document.querySelector("form");
form.addEventListener("submit", event => {
  if (!form.reportValidity()) return;
  event.preventDefault();
  const data = new FormData(form, event.submitter);
  const query = new URLSearchParams();
  for (const [key, value] of data) {
    if (typeof value === "string") query.append(key, value);
  }
  window.location.assign(`${form.action}?${query}`);
});
```

This fragment deliberately keeps a GET navigation; asynchronous fetching can replace that last step if the application implements history, focus, and errors correctly. `FormData` can contain files; silently converting files to strings is inappropriate for upload forms. Multiple controls can share a name, so preserve repeated entries when the API expects them.

## Content, metadata, and discoverability

A meaningful document title identifies the current resource in tabs, history, and assistive technology. Set the document language and mark language changes when they affect pronunciation. A canonical URL can consolidate duplicate public resources, but it cannot repair a server that returns success for nonexistent content.

Metadata and structured data should agree with visible content. Do not serialize private records into public HTML because an interface later hides them. Search engines, previews, browser caches, and “view source” all consume delivered bytes.

For product media, alt text conveys the image's purpose in context; purely decorative images use empty alt text. Form help is not a substitute for a label. Placeholder text disappears during typing and often has insufficient contrast. Native semantics reduce the number of custom behaviors a team must maintain, test, and explain.

## Failure cases worth reviewing

Review the page with JavaScript delayed, styles disabled, only a keyboard, and a narrow viewport. Then inspect the actual submitted request. Check that Enter submits the intended action, files retain the correct encoding, repeated values survive, and server errors preserve state.

The question is whether the document provides a coherent interaction contract. If every native feature has been replaced, the team now owns browser behavior that previously came for free.
