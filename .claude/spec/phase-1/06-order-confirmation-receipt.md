# 6 — Order confirmation + receipt

**Phase:** 1 · **Depends on:** feature 5, feature 10 (WhatsApp), email provider · **Status:** To build

## Purpose
Confirm the purchase on-screen and deliver a receipt by email + WhatsApp.

## Build
- `/order/confirmed?no=...` page.
- Receipt email via Resend/SES.
- WhatsApp confirmation (feature 10).

## Data
Reads `orders` by `order_number`.

## API
Triggered from the checkout confirm step / webhook (feature 5). Email send in a server route; WhatsApp via `/lib/whatsapp.ts`.

## UI
Confirmation page shows: order number, items, total, **delivery estimate**. Friendly next-steps (track order link, WhatsApp updates note).

## Tech notes
- Sends are **non-fatal**: a failed email/WhatsApp must not fail the order — log and continue.
- Guard the page so it shows only summary-safe data (no payment internals); ideally require the `no` param to match a real paid order.
- Idempotent: don't double-send if both confirm-call and webhook fire.

## Deps / env
`EMAIL_API_KEY` (Resend/SES), WhatsApp env (feature 10).

## Acceptance
- Confirmation page shows order number, items, total, and delivery estimate.
- Receipt is delivered (email + WhatsApp); send failures are logged, not fatal.
