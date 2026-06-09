# 13 — Analytics dashboard (in-admin)

**Phase:** 1 · **Depends on:** A2, A6, feature 12 · **Status:** To build

## Purpose
The client never has to open GA — key numbers live inside admin.

## Build
`/admin/analytics` with charts (**Recharts**).

## Data
- Revenue / orders / AOV / conversion derived from `orders`.
- Visitors / top pages from `pageviews` (and/or Plausible API in Phase 2, feature 22).

## UI / metrics
Visitors, top pages, orders, revenue, conversion rate, AOV, abandoned carts. Date-range selector.

## Tech notes
- Conversion rate = paid orders / sessions (sessions from `pageviews.session_id` distinct).
- AOV = revenue / paid orders over the range. Money in paise → format to ₹ at display.
- Abandoned carts from `carts` where `status='active'`/`abandoned` (feature 18 populates this in Phase 2; show 0 gracefully until then).
- Compute server-side (service role) behind the admin gate.

## Acceptance
- Numbers reconcile with the `orders` table for the selected range.
- Charts render for a date range without errors.
