# 25 — B2B tiered pricing / portal

**Phase:** 3 · **Depends on:** A6 (auth), feature 15 (B2B inquiries), feature 1/2 (catalog/PDP) · **Status:** To build

## Purpose
Gated wholesale pricing for approved B2B customers (only if demand appears).

## Build
- Gated login with wholesale pricing.
- Extend `customers` / auth with a **B2B role** + price lists.

## Data
Add B2B role + `price_lists` (or per-tier pricing) tables; link approved customers to a tier. Approval flow originates from feature 15 leads.

## Tech notes
- Consumer pricing must remain the default; B2B pricing shown only to authenticated, approved B2B users.
- Re-price server-side based on the authenticated user's tier — never expose wholesale prices to anon.

## Acceptance
- Approved B2B users see tiered pricing; consumers never do.
- Pricing resolves server-side from the user's tier.
