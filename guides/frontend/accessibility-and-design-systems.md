# Accessibility and design systems as engineering contracts

Accessible interfaces coordinate visual presentation, keyboard input, assistive technology, motion preferences, and changing content. Native HTML provides much of this shared contract. ARIA extends semantics when native elements cannot express a required interaction; it does not implement the interaction itself.

Design systems arose to keep recurring decisions consistent across growing products. Their most valuable output is tested behavior and a stable API, not a gallery of attractive rectangles.

## Names, roles, and states must describe the action

An accessible name tells users what a control does; its role tells them how it behaves. A toggle button can use a stable name and `aria-pressed`; an expandable section uses `aria-expanded` and identifies the controlled content. Do not add an ARIA role that conflicts with native behavior merely to satisfy an automated rule.

```html
<button type="button" aria-expanded="false" aria-controls="billing-help"
        id="billing-help-toggle">
  Billing help
</button>
<div id="billing-help" hidden>
  <p>Invoices are available after the billing period closes.</p>
</div>
```

The application must keep the attribute and visibility synchronized. The attributes alone do not open the panel. A visually hidden accessible label is appropriate when the visual context is unambiguous, but avoid names that diverge from the visible wording and break speech-input expectations.

## Keyboard behavior depends on the interaction pattern

Ordinary links and buttons participate in sequential focus. Composite widgets such as tab lists and menus may use arrow keys and managed internal focus. Implement the complete expected pattern rather than making every child independently tabbable.

An ordinary navigation list should not acquire `role="menu"` just because it looks like a menu. That role introduces application-style keyboard expectations. Start with a list of links unless the product needs the richer behavior.

Focus order should follow a coherent DOM order. Visual reordering can create a keyboard sequence that appears to jump around. A visible focus indicator must survive themes and forced-color settings. Pointer-only hover behavior needs a keyboard and touch equivalent.

## Overlays have a lifecycle

A modal needs an accessible name, meaningful initial focus, containment of focus, an appropriate close action, background interaction management, and focus restoration. Native `dialog` opened with `showModal()` supplies useful top-layer and modal behavior, reducing the custom code a team owns.

```html
<button id="open-settings" type="button">Notification settings</button>
<dialog id="settings" aria-labelledby="settings-title">
  <h2 id="settings-title">Notification settings</h2>
  <form method="dialog">
    <label><input type="checkbox" name="email"> Email updates</label>
    <button value="close">Close settings</button>
  </form>
</dialog>
<script type="module">
  const trigger = document.getElementById("open-settings");
  const dialog = document.getElementById("settings");
  trigger.addEventListener("click", () => dialog.showModal());
  dialog.addEventListener("close", () => trigger.focus());
</script>
```

This standalone example manages a simple settings dialog; it does not persist a preference. In an application, restore focus to a meaningful surviving destination if the original trigger was removed. Large dialogs may need initial focus on introductory content rather than a control far below the title. Decide whether backdrop clicks should close, and protect unsaved work when dismissal would lose it.

## Dynamic updates need restrained announcements

For asynchronous outcomes, a live region can announce a short status without moving focus. Keep a status region in the document and update its text. Use assertive interruption only for genuinely urgent events.

```html
<p id="save-status" role="status"></p>
```

```javascript
document.getElementById("save-status").textContent = "Changes saved";
```

Do not place an entire frequently updating table in a live region. Repeated announcements can make the interface unusable. For validation errors, combine field associations with an actionable summary. For client navigation, update the title and choose an appropriate focus destination so users discover that the page changed.

Virtualized lists reduce DOM work but can alter screen-reader navigation, browser search, selection, and focus retention. Preserve the selected item during recycling, communicate position/count where the widget pattern calls for it, and test representative assistive technology. A high-performance list that loses the focused row fails its task.

## Build components around stable obligations

A design-system button API should make correct markup easy: clear action type, loading behavior, disabled semantics, accessible naming, and focus styling. Do not hide critical semantics behind a `div` factory accepting every possible prop.

Tokens should represent roles such as text, surface, focus, spacing, and motion. Component APIs should distinguish mutually exclusive variants and avoid dozens of boolean combinations. Document controlled versus uncontrolled behavior, event timing, and responsibility for validation.

For shared components, treat changes to focus order, DOM structure, accessible names, and keyboard interaction as compatibility changes. A color update may be low risk; replacing a native select with a custom widget expands behavior and test obligations substantially.

## Localization changes layout and meaning

Use locale-aware formatting for dates, numbers, and plural forms. Keep stored values canonical and presentation localized. Do not parse user-visible localized currency strings back into business values when the source amount is available.

```javascript
const amountMinor = 123456;
const formatted = new Intl.NumberFormat("de-DE", {
  style: "currency", currency: "EUR",
}).format(amountMinor / 100);
console.log(formatted);
```

This example assumes a currency with two fractional digits; general money code must use currency-specific minor-unit rules. Dates need an explicit timezone policy for deadlines and appointments. A timestamp formatted on server and client with different defaults can create hydration mismatches and misleading deadlines.

## Test beyond automated violations

Automation can find many missing names, invalid attributes, and contrast issues, but cannot establish that a custom editor is understandable or that an error recovery flow is usable. Test keyboard-only operation, zoom/reflow, reduced motion, forced colors, and representative screen readers.

Review one complete task, including opening, editing, failure, retry, and closing. Feed recurring fixes into shared primitives and usage guidance. The system succeeds when teams can ship a correct interaction without rediscovering the same edge cases.
