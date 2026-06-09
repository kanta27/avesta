# 8 — Discount-code engine

**Phase:** 1 · **Depends on:** A2, A3, feature 5 (checkout), feature 12 (admin) · **Status:** To build

## Purpose
Validate and apply discount codes server-side at checkout.

## Build
- `/lib/discounts.ts` validation module.
- Applied inside checkout (feature 5); codes managed in admin (feature 12).

## Data
`discount_codes`, `discount_redemptions`.

## API
A server-side `validateAndApply({ code, phone, subtotalPaise })` returning either a computed discount (`discount_paise`, `free_shipping`) or a rejection reason. Called during create-order; redemption written only on `paid`.

## Rules
- Kinds: **percent** (`value_pct`), **flat** (`value_paise`), **free_shipping**.
- `min_order_paise` threshold.
- Global `usage_limit` vs `used_count`.
- `per_phone_limit` (count redemptions for that phone).
- `starts_at` / `expires_at` window; `is_active` flag.

## Tech notes
- All validation is **server-side**; the cart field is just UX. Reject with clear messages: invalid, expired, not yet active, below min order, usage limit reached, already used by this phone.
- On paid order: insert `discount_redemptions` and increment `used_count` atomically (one transaction) to avoid race over-redemption.

## Acceptance
- Invalid / expired / over-limit / below-min codes are rejected server-side with clear messages.
- A valid code reduces the server-computed total; redemption is recorded only on a paid order; limits are enforced under concurrent use.
