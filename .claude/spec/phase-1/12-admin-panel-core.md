# 12 — Admin panel core

**Phase:** 1 · **Depends on:** A2, A3, A6, feature 10 (WhatsApp) · **Status:** To build

## Purpose
Let the client edit everything without code — a custom CMS, no third-party.

## Build
`/admin` (behind the A6 gate). Modules below; forms write via **server actions with the service role** after `requireAdmin()`.

### Modules (Phase 1 subset)
- **Products** — name, price, **pack tiers**, images (Supabase Storage upload via signed URL), ingredients, bioactives, FAQs, badges, stock count, `is_active` toggle.
- **Orders** — list + filters; update status (paid → packed → shipped → delivered); paste `tracking_url` + `courier`; setting status to **`shipped` triggers WhatsApp/email** (feature 10).
- **Discount codes** — create code, kind, value, min order, limits, expiry (feature 8 data).
- **Leads** — view/filter/export **CSV**; conversion column.

## Data
Writes `products`, `discount_codes`; updates `orders`; reads `leads`. Image upload to `products` storage bucket.

## API
Server actions guarded by `requireAdmin()`; status transitions call the WhatsApp wrapper on `shipped`.

## Tech notes
- Editing `pack_tiers` needs a small repeatable-row editor (key/label/units/price/discount/per-day/default).
- CSV export streams from `leads`.
- Status change to `shipped` must persist tracking **before** firing the notification.

## Acceptance
A non-dev can, without touching code:
- create a product (with pack tiers + images),
- fulfil an order (set shipped + tracking → customer notified),
- issue a discount code,
- export leads to CSV.
