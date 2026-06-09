# 18 — Abandoned-cart WhatsApp recovery

**Phase:** 2 · **Depends on:** A2, A3, feature 5 (checkout), feature 10 (WhatsApp), Vercel Cron · **Status:** To build

## Purpose
Recover started-but-unpaid checkouts with a single WhatsApp nudge.

## Build
- Capture the cart with phone **at checkout start** into `carts`.
- Vercel Cron route that finds stale `active` carts and sends one recovery message.

## Data
`carts` (`phone`, `email`, `items`, `status`, `last_seen_at`, `recovery_sent`).

## API
- On checkout start (feature 5 step 1), upsert a `carts` row (`active`).
- `GET /api/cron/cart-recovery` — finds `active` carts older than **N hours** with no paid order → sends one WhatsApp nudge → sets `recovery_sent=true` and/or `status='abandoned'`.
- On paid order, flip the matching cart to `converted` / `recovered`.

## Tech notes
- Exactly **one** recovery message per cart (`recovery_sent` guard).
- Match by phone; a paid order before the cron runs should suppress the nudge.

## Acceptance
- A started-but-unpaid checkout gets exactly one recovery message.
- A conversion flips the cart to `converted`/`recovered` and prevents the nudge.
