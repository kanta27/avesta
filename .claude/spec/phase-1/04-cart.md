# 4 — Cart

**Phase:** 1 · **Depends on:** A1, A2 · **Status:** To build

## Purpose
Hold multiple products with chosen pack tiers; persist across refresh.

## Build
- Cart store (**Zustand** or React context) persisted to `localStorage`.
- `/cart` page **and** a slide-over (drawer) reused site-wide.

## Data
None server-side until checkout (guest-first). Store only minimal item refs.

## UI
- Line items with pack tier + qty, edit/remove.
- Subtotal and **₹/day rollup**.
- Discount-code field (validated server-side at checkout, not here).
- "Proceed to checkout."

## Tech notes
- Store minimal refs only: `{ product_id, pack_key, qty }` (+ optional `bundle_id`). **Re-price from DB at checkout** to prevent tampering — never trust cart-stored prices.
- Display prices are fetched/hydrated from product data; the source of truth for money is always the server.
- Cart drawer opens on add-to-cart from anywhere (shop, PDP, bundles).

## Acceptance
- Cart survives a page refresh (localStorage).
- Quantity and pack changes recompute the displayed subtotal and ₹/day.
- Stored items contain refs only — no trusted price fields used at checkout.
