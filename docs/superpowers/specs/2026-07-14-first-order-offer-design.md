# 50% First-Order Offer — Design

## Goal

Promote a "50% off your first order" offer on the two mastering services so it is
clearly visible to first-time visitors and referenced in the services surfaces and
the enquiry form.

## Scope

Offer applies to two services in `src/data/services.ts`:

- **01 Mastering** (solo mastering)
- **02 Mixing** (mixing + mastering included)

Eligibility meaning: **first order / new client**. Copy says "first order". No order-history
tracking, coupon codes, or automated discount at payment — honesty handled manually at enquiry.

Display mechanism: **sitewide dismissible promo bar** plus contextual badges on the two
services and a note in the enquiry form.

## Canonical copy

- Bar: `50% OFF your first order — half-price Mastering & Mixing for new clients.`
- Card badge: `50% OFF 1ST ORDER`
- Modal line: `50% off your first order.`
- Form note: `New client? Your first Mastering or Mixing order is 50% off — mention it here.`
- Select options: `Mastering (50% off first order)`, `Mixing & Mastering (50% off first order)`

Exact wording can be tuned during implementation; keep "first order" and "50%".

## Components

### 1. PromoBar (new) — `src/components/PromoBar.astro`

- Thin full-width bar rendered in `Layout.astro` **above** `<Header/>`.
- Accent-blue styling, mono uppercase, matching the site's existing tokens
  (`--color-accent`, `font-mono`, tracking). No new colours.
- Content: offer copy + link to `/contact`, and a `×` close button.
- Dismissal: click `×` sets `localStorage['promo-firstorder-dismissed'] = '1'` and hides the bar.
  Inline script checks the key on load and hides immediately if set (before paint, to avoid flash).
- Static block — pushes the header down, no fixed positioning, no layout shift on dismiss beyond
  the bar collapsing.
- Respects `prefers-reduced-motion` (no animated entrance, or motion-safe only).

### 2. Service data flag — `src/data/services.ts`

- Add optional field to the `Service` interface: `firstOrderOffer?: boolean;`
- Set `firstOrderOffer: true` on service `01` (Mastering) and `02` (Mixing).
- Single source of truth, so cards and modal derive the offer from this flag.

### 3. ServiceCard badge — `src/components/ServiceCard.astro`

- When `service.firstOrderOffer`, render a small pill badge (e.g. top-right area near
  `Open →`) reading `50% OFF 1ST ORDER`.
- Styled with the channel colour (`--ch`) so it fits each card's identity.
- Pass the flag through to the modal via a `data-offer` attribute on the `.service-card` button
  (e.g. `data-offer={service.firstOrderOffer ? '1' : undefined}`).

### 4. ServiceModal — `src/components/ServiceModal.astro`

- Add a hidden accent line near the price row (after the `modal-price` / `modal-note` block).
- In `openModal`, if `card.dataset.offer` is set, show the line `50% off your first order.`;
  otherwise keep it hidden. Mirror the existing show/hide pattern used for the revisions row.

### 5. Contact form — `src/pages/contact.astro`

- Add a highlighted static note near the top of the form (above the fields or directly under the
  `Service Required` label): the form-note copy above.
- Reword the two relevant `<select>` options to the offer variants listed under Canonical copy.
- No conditional JS required; the note is always visible on the enquiry form.

## Files touched

- `src/components/PromoBar.astro` (new)
- `src/layouts/Layout.astro` (render PromoBar)
- `src/data/services.ts` (interface field + flag on 01/02)
- `src/components/ServiceCard.astro` (badge + data-offer)
- `src/components/ServiceModal.astro` (offer line show/hide)
- `src/pages/contact.astro` (form note + select option wording)

## Non-goals

- No coupon / promo-code system.
- No payment-side automatic discount.
- No per-browser "first visit" tracking; the bar's localStorage flag only governs
  dismissal of the bar, not eligibility.
- No changes to prices page numbers (the `£30` / `£50` list prices stay; the offer is a
  new-client discount noted separately). Revisit only if the user asks.

## Testing / verification

- Build passes (`astro build`) with no TypeScript errors on the new `firstOrderOffer` field.
- Manual: bar shows on first load across pages; `×` dismisses and stays dismissed on reload
  (localStorage). Badge appears only on Mastering + Mixing cards. Modal shows the offer line
  for those two, hidden for the other four. Contact form shows the note and updated options.
