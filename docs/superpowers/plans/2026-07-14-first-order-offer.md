# 50% First-Order Offer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface a "50% off your first order" offer for Mastering and Mixing across a sitewide promo bar, service cards, the service modal, and the enquiry form.

**Architecture:** Add a `firstOrderOffer` flag to the single-source service catalogue (`src/data/services.ts`); cards and modal derive the offer from it. A new dismissible `PromoBar.astro` renders in the layout above the header, gated by a `localStorage` dismissal key. The contact form gets a static note and reworded select options.

**Tech Stack:** Astro 7 components, Tailwind v4 (via `@tailwindcss/vite`), vanilla inline `<script>`, `localStorage`. No test framework in this project — verification is `npm run build` (type-checks `.astro` + TS) plus manual browser checks.

## Global Constraints

- Offer copy must keep the phrase "first order" and "50%". Canonical strings:
  - Bar: `50% OFF your first order — half-price Mastering & Mixing for new clients.`
  - Card badge: `50% OFF 1ST ORDER`
  - Modal line: `50% off your first order.`
  - Form note: `New client? Your first Mastering or Mixing order is 50% off — mention it here.`
  - Select options: `Mastering (50% off first order)`, `Mixing & Mastering (50% off first order)`
- Offer applies ONLY to service `01` (Mastering) and `02` (Mixing). The other four must not show any offer UI.
- No coupon codes, no payment-side discount, no first-visit tracking. `localStorage` key governs only bar dismissal.
- Use existing design tokens only (`--color-accent`, `--color-fg`, `font-mono`, `--ch` channel colour). No new colours.
- Tailwind v4 note: never put parentheses in comments inside `@theme`; avoid `--color-base` token collisions (see repo memory). No `@theme` edits are required by this plan.
- Respect `prefers-reduced-motion` for any bar animation.

---

### Task 1: Add offer flag to the service catalogue

**Files:**
- Modify: `src/data/services.ts`

**Interfaces:**
- Produces: `Service.firstOrderOffer?: boolean`, set `true` on the objects with `num: '01'` and `num: '02'`. Consumed by ServiceCard (Task 3) and, via `data-offer`, by ServiceModal (Task 4).

- [ ] **Step 1: Add the interface field**

In the `Service` interface (after `shopHref?: string;`), add:

```ts
  firstOrderOffer?: boolean; // 50% off first order — shows the promo badge/line on this service
```

- [ ] **Step 2: Flag the two services**

On the `num: '01'` (Mastering) object, add `firstOrderOffer: true,` (e.g. after its `revisions` field). Do the same on the `num: '02'` (Mixing) object. Leave `03`–`06` untouched.

- [ ] **Step 3: Type-check via build**

Run: `npm run build`
Expected: build succeeds, no TS errors. (Nothing renders the flag yet; this only confirms the type change compiles.)

- [ ] **Step 4: Commit**

```bash
git add src/data/services.ts
git commit -m "feat: add firstOrderOffer flag to Mastering and Mixing services"
```

---

### Task 2: Sitewide promo bar

**Files:**
- Create: `src/components/PromoBar.astro`
- Modify: `src/layouts/Layout.astro`

**Interfaces:**
- Produces: `<PromoBar />` component rendered once, above `<Header />`. Uses `localStorage` key `promo-firstorder-dismissed` (value `'1'` = dismissed).

- [ ] **Step 1: Create the PromoBar component**

Create `src/components/PromoBar.astro`:

```astro
---
// Sitewide first-order offer bar. Rendered above the header in Layout.astro.
// Dismissal is remembered per-browser via localStorage; the offer itself is a
// manual new-client discount, not tied to this flag.
---

<div id="promo-bar" class="hidden border-b border-line-strong bg-panel">
  <div class="max-w-4xl mx-auto flex items-center justify-center gap-3 px-4 py-2 font-mono">
    <a href="/contact" class="group flex items-center gap-2 no-underline text-center">
      <span class="text-accent text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">50% OFF your first order</span>
      <span class="hidden sm:inline text-fg-muted text-[10px] uppercase tracking-[0.15em]">— half-price Mastering &amp; Mixing for new clients</span>
      <span class="text-fg-faint group-hover:text-accent transition-colors text-[11px]">&rarr;</span>
    </a>
    <button id="promo-close" type="button" aria-label="Dismiss offer" class="absolute right-3 w-6 h-6 flex items-center justify-center text-fg-faint hover:text-accent transition-colors text-sm leading-none">&times;</button>
  </div>
</div>

<script is:inline>
  (function () {
    var KEY = 'promo-firstorder-dismissed';
    var bar = document.getElementById('promo-bar');
    if (!bar) return;
    try {
      if (localStorage.getItem(KEY) === '1') return; // stay hidden
    } catch (e) { /* localStorage blocked — just show the bar */ }
    bar.classList.remove('hidden');
    var close = document.getElementById('promo-close');
    if (close) {
      close.addEventListener('click', function () {
        bar.classList.add('hidden');
        try { localStorage.setItem(KEY, '1'); } catch (e) {}
      });
    }
  })();
</script>
```

Notes:
- Wrapper is `position: relative` implicitly via the inner container; the close button uses `absolute right-3` inside the centered flex row. The row container needs `relative` — add `relative` to the inner `div` class list if the absolute button is not positioning correctly during manual check.
- Starts `hidden`; the inline script reveals it unless dismissed. Because the script is `is:inline` it runs immediately on parse, minimizing flash.

- [ ] **Step 2: Fix positioning context for the close button**

Ensure the inner container establishes a positioning context. In the component above, change the inner container line to:

```astro
  <div class="relative max-w-4xl mx-auto flex items-center justify-center gap-3 px-4 py-2 font-mono">
```

- [ ] **Step 3: Render it in the layout**

In `src/layouts/Layout.astro`, import and render above `<Header />`.

Add to the frontmatter imports (after the `Header` import):

```astro
import PromoBar from '../components/PromoBar.astro';
```

In the body, replace:

```astro
    <Header />
```

with:

```astro
    <PromoBar />
    <Header />
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds, no errors.

- [ ] **Step 5: Manual check**

Run: `npm run dev` (or `astro dev --background` per CLAUDE.md).
Verify: on any page the bar shows at the very top with the offer copy; clicking `×` hides it; reloading keeps it hidden. Clear `localStorage` (or new private window) → bar returns. Link goes to `/contact`.

- [ ] **Step 6: Commit**

```bash
git add src/components/PromoBar.astro src/layouts/Layout.astro
git commit -m "feat: sitewide dismissible 50% first-order promo bar"
```

---

### Task 3: Service card badge + data-offer passthrough

**Files:**
- Modify: `src/components/ServiceCard.astro`

**Interfaces:**
- Consumes: `service.firstOrderOffer` from Task 1.
- Produces: `data-offer` attribute on the `.service-card` button (present only when the offer applies), read by ServiceModal in Task 4.

- [ ] **Step 1: Add the data-offer attribute**

In the `<button>` opening tag (after `data-shop={service.shopHref}`), add:

```astro
  data-offer={service.firstOrderOffer ? '1' : undefined}
```

(`undefined` omits the attribute entirely when there is no offer.)

- [ ] **Step 2: Render the badge**

Inside the top row, replace this block:

```astro
  <div class="flex items-start justify-between">
    <span class="svc-num">{service.num}</span>
    <span class="svc-open">Open &rarr;</span>
  </div>
```

with:

```astro
  <div class="flex items-start justify-between">
    <span class="svc-num">{service.num}</span>
    <div class="flex flex-col items-end gap-1.5">
      {service.firstOrderOffer && <span class="svc-offer">50% OFF 1ST ORDER</span>}
      <span class="svc-open">Open &rarr;</span>
    </div>
  </div>
```

- [ ] **Step 3: Add badge styles**

In the `<style>` block (after the `.svc-open` rules, before `.svc-body`), add:

```css
  .svc-offer {
    font-family: var(--font-mono);
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--ch);
    border: 1px solid color-mix(in srgb, var(--ch) 45%, transparent);
    padding: 2px 6px;
    white-space: nowrap;
  }
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Manual check**

Dev server: on the homepage grid and `/services`, the badge `50% OFF 1ST ORDER` appears ONLY on the Mastering and Mixing cards, coloured to match each card. Cards 03–06 show no badge and still render `Open →` normally.

- [ ] **Step 6: Commit**

```bash
git add src/components/ServiceCard.astro
git commit -m "feat: show 50% first-order badge on Mastering and Mixing cards"
```

---

### Task 4: Service modal offer line

**Files:**
- Modify: `src/components/ServiceModal.astro`

**Interfaces:**
- Consumes: `data-offer` on the clicked `.service-card` (Task 3), surfaced as `card.dataset.offer`.

- [ ] **Step 1: Add the hidden offer line to the markup**

In the price block, replace:

```astro
      <div class="flex items-end justify-between border-t border-line pt-4">
        <div>
          <span class="font-mono text-[9px] uppercase tracking-[0.2em] text-fg-faint block">From</span>
          <span id="modal-price" class="font-display text-3xl font-bold text-accent leading-none">£20</span>
        </div>
        <span id="modal-note" class="font-mono text-[9px] uppercase tracking-[0.2em] text-fg-faint text-right max-w-[50%]"></span>
      </div>
```

with:

```astro
      <div class="flex items-end justify-between border-t border-line pt-4">
        <div>
          <span class="font-mono text-[9px] uppercase tracking-[0.2em] text-fg-faint block">From</span>
          <span id="modal-price" class="font-display text-3xl font-bold text-accent leading-none">£20</span>
        </div>
        <span id="modal-note" class="font-mono text-[9px] uppercase tracking-[0.2em] text-fg-faint text-right max-w-[50%]"></span>
      </div>

      <p id="modal-offer" class="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-accent">50% off your first order.</p>
```

- [ ] **Step 2: Toggle the line in openModal**

In the `<script>`, inside `openModal`, after the revisions-row block (the `if (revRow) { ... }` block, before the `const dot` line), add:

```ts
      const offerLine = document.getElementById('modal-offer');
      if (offerLine) {
        offerLine.classList.toggle('hidden', d.offer !== '1');
      }
```

(`d` is already `card.dataset`; `d.offer` is the value of `data-offer`.)

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds, no TS errors.

- [ ] **Step 4: Manual check**

Dev server: open the Mastering and Mixing modals → the `50% off your first order.` line shows under the price. Open Production/Education/Tools/Track Analysis → the line is hidden. Reopen a non-offer service after an offer one to confirm it toggles off (no stale state).

- [ ] **Step 5: Commit**

```bash
git add src/components/ServiceModal.astro
git commit -m "feat: show first-order offer line in service modal"
```

---

### Task 5: Enquiry form note + select wording

**Files:**
- Modify: `src/pages/contact.astro`

**Interfaces:**
- Consumes: nothing programmatic — static markup edits only.

- [ ] **Step 1: Reword the two select options**

In the `<select id="service">`, replace:

```astro
                <option value="mastering">Mastering</option>
                <option value="mixing-mastering">Mixing &amp; Mastering</option>
```

with:

```astro
                <option value="mastering">Mastering (50% off first order)</option>
                <option value="mixing-mastering">Mixing &amp; Mastering (50% off first order)</option>
```

- [ ] **Step 2: Add the offer note above the fields**

Directly after the honeypot paragraph line:

```astro
            <p class="hidden"><label>Don't fill this out: <input name="bot-field" /></label></p>
```

add:

```astro
            <p class="border border-accent/40 bg-accent-dim/10 px-4 py-3 font-mono text-[10px] leading-relaxed uppercase tracking-[0.15em] text-accent">
              New client? Your first Mastering or Mixing order is 50% off &mdash; mention it here.
            </p>
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manual check**

Dev server on `/contact`: the highlighted note shows at the top of the form; the service dropdown shows the two `(50% off first order)` options; layout is intact on mobile and desktop widths.

- [ ] **Step 5: Commit**

```bash
git add src/pages/contact.astro
git commit -m "feat: note 50% first-order offer in enquiry form"
```

---

## Self-Review

- **Spec coverage:** Promo bar → Task 2. Service flag → Task 1. Card badge → Task 3. Modal line → Task 4. Contact note + select wording → Task 5. Non-goals (no coupons/tracking/price changes) respected — no task touches payment or the prices page. All spec sections covered.
- **Placeholder scan:** No TBD/TODO; every code step shows full content.
- **Type consistency:** `firstOrderOffer?: boolean` defined in Task 1, read in Task 3, passed as `data-offer` (`'1'`/omitted) and read as `d.offer === '1'` / `!== '1'` in Task 4 — consistent. `localStorage` key `promo-firstorder-dismissed` identical in both bar script references.
- **Verification note:** No unit-test framework exists; each task verifies via `npm run build` (type-check) plus a targeted manual browser check, which is the appropriate cycle for this static Astro site.
