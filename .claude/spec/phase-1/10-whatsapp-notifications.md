# 10 — WhatsApp order notifications

**Phase:** 1 · **Depends on:** A4, feature 5 · **Status:** To build

## Purpose
Transactional WhatsApp on order paid and shipped.

## Build
`/lib/whatsapp.ts` — a provider-agnostic wrapper around Interakt/AiSensy templates. Called on `paid` and on `shipped`.

## Data
Reads `orders` (number, items, total, `tracking_url`, `courier`, `customer_phone`).

## API
- `sendOrderConfirmation(order)` — on transition to `paid`.
- `sendShippedNotification(order)` — when admin sets status `shipped` (feature 12).

## Tech notes
- Use **approved message templates** (WhatsApp requires pre-approval for business-initiated messages).
- Abstract the provider so **AiSensy ↔ Interakt is a config swap** (`WHATSAPP_PROVIDER`); same interface, two implementations.
- Don't over-message (rate-limit risk). Sends are **non-fatal**: log failures, never fail the order.

## Deps / env
`WHATSAPP_PROVIDER`, `WHATSAPP_API_KEY`.

## Acceptance
- Confirmation fires on `paid`; shipped + tracking link fires on `shipped`.
- Provider can be switched via env without code changes.
- Send failures are logged and do not affect order state.
