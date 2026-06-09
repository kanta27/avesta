# 23 — Subscriptions (Razorpay recurring)

**Phase:** 3 · **Depends on:** A5 (payments), feature 2 (PDP), feature 12 (admin) · **Status:** To build

## Purpose
"Subscribe & save" recurring orders.

## Build
- "Subscribe & save" option on PDP.
- Mandate / token orders via the **payment interface** (A5) — extend `PaymentProvider` with subscription methods rather than importing Razorpay directly.
- Manage subscriptions in the lightweight account (feature 7) + admin.

## Data
Add a `subscriptions` table (plan, product/pack, customer phone, status, next charge date, provider mandate id) — design alongside this feature.

## Tech notes
- **Apply for Razorpay recurring approval early** — it has lead time; gate the build on that approval.
- Keep all recurring logic behind the abstraction so a gateway swap remains one-file.

## Acceptance
- A recurring mandate can be created and charged through the abstraction layer (test mode).
- Customer can view/cancel; admin can see active subscriptions.
