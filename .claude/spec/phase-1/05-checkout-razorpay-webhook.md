# 5 — Single-page checkout + Razorpay + webhook

**Phase:** 1 · **Depends on:** A2, A3, A5, feature 4, feature 8 (discounts), feature 10 (WhatsApp) · **Status:** To build

## Purpose
Prepaid, low-friction, **guest** checkout (no forced signup).

## Build
- `/checkout` page (address + order summary + pay button).
- `POST /api/checkout/create-order`
- `POST /api/webhooks/razorpay`

## Data
Writes `orders` (`created` → `paid`), upserts `customers`, writes `discount_redemptions`. Reads `products`/`bundles`/`discount_codes` for re-pricing and validation.

## API flow
1. **Create order** — client posts cart refs + address. Server **re-prices from DB**, validates/applies discount (feature 8), computes subtotal/discount/shipping/total, inserts an `orders` row (`created`), generates `order_number`, calls `createPaymentOrder()` (A5), returns `{ providerOrderId, razorpayKeyId, orderNumber }`.
2. **Pay** — Razorpay Checkout opens (UPI front and center, cards, netbanking).
3. **Confirm** — on success client posts `{ providerOrderId, paymentId, signature }`; server **verifies signature** (A5), marks order `paid`, fires confirmation WhatsApp + email (feature 6/10).
4. **Webhook** — `payment.captured` independently verified with `RAZORPAY_WEBHOOK_SECRET`; this is the **source of truth** and handles closed-tab cases.

## Tech notes
- **Never trust client-sent prices** — re-price everything server-side.
- **Idempotent webhook**: dedupe on `razorpay_payment_id`; safe to receive the confirm call and the webhook for the same payment (whichever lands first marks `paid`, the second is a no-op).
- Record `razorpay_order_id` and `razorpay_payment_id` on the order.
- Discount redemption is written only on a `paid` order; increment `discount_codes.used_count` atomically.
- Validate address (pincode 6-digit, phone 10-digit) server-side.

## Deps / env
`razorpay` SDK (via A5). Env: `RAZORPAY_*`, `RAZORPAY_WEBHOOK_SECRET`.

## Acceptance
- A test payment creates a `paid` order, sends a receipt, and is reconciled by the webhook **even if the browser closes mid-flow**.
- Tampered prices are ignored (server total wins).
- Replayed webhook does not double-create or double-count redemptions.
