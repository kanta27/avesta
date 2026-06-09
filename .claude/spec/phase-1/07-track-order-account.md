# 7 — Track Order / lightweight account

**Phase:** 1 · **Depends on:** A2, A3, feature 4 (cart, for reorder) · **Status:** To build

## Purpose
Let guests check status without an account; minimal order history on phone match.

## Build
- `/track` page (lookup by **order number + phone**).
- Minimal order history list when the phone matches.

## Data
Reads `orders` by `order_number` **and** `customer_phone` via a **server route** (orders are not anon-readable — see A3).

## API
`POST /api/track` (or a server action) taking `{ orderNumber, phone }`, returning the order only if both match. Never expose orders by number alone.

## UI
- Status timeline: created → paid → packed → shipped → delivered.
- Tracking link (`tracking_url` + `courier`) when present.
- **Reorder** button — re-adds the order's items to the cart.

## Tech notes
- The number+phone pair is the authz check — both must match. Rate-limit lookups to deter enumeration.
- Reorder maps `orders.items` back to cart refs (`product_id`, `pack_key`, `qty`).

## Acceptance
- Order shown **only** when number + phone match; mismatch reveals nothing.
- Status timeline reflects the current `status`; reorder repopulates the cart.
