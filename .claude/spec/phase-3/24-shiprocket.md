# 24 — Shiprocket API integration

**Phase:** 3 · **Depends on:** feature 5 (orders), feature 10 (WhatsApp), feature 12 (admin) · **Status:** To build

## Purpose
Replace manual tracking — automate fulfilment and tracking sync.

## Build
- Push orders to Shiprocket (create shipment on `paid`/`packed`).
- Pull AWB / tracking back onto the `orders` row automatically.

## Data
Updates `orders.tracking_url`, `orders.courier`, status.

## API
- `/lib/shipping/shiprocket.ts` wrapper (auth, create order, fetch AWB/track).
- Webhook or polling cron to pull tracking updates → update order → notify customer (feature 10).

## Tech notes
- Mirror the payment-abstraction pattern: a shipping interface so couriers can be swapped later.
- On Shiprocket pickup/AWB assignment, auto-fill tracking and fire the shipped WhatsApp.

## Acceptance
- Marking an order shipped (or Shiprocket pickup) auto-fills tracking and notifies the customer — no manual link pasting.
