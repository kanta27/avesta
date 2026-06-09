# 22 — Analytics / pixel layer

**Phase:** 2 · **Depends on:** A4, feature 5 (purchase event), feature 13 (admin dashboard) · **Status:** To build

## Purpose
Client-side + server-side tracking for ads, surfaced inside admin.

## Build
- GA4 **or** self-hosted Plausible/Umami.
- Meta Pixel.
- **Server-side conversion tracking** from day one of ads (purchase events on paid order).
- Feed traffic stats into the admin dashboard (feature 13).

## Data
Writes `pageviews` (in-house); reads back into feature 13. Plausible API optional for top-pages.

## API
- Client: page-view + standard events (ViewContent, AddToCart, InitiateCheckout, Purchase).
- Server: send Purchase conversion server-side on `paid` (Meta Conversions API / GA Measurement Protocol) for reliability past ad-blockers.

## Tech notes
- Gate pixels behind consent where required; keep PII out of client events.
- Server-side purchase event is the source of truth for ad attribution; dedupe with the client event via event id.

## Deps / env
`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID` (+ server tokens for CAPI if used).

## Acceptance
- Pageviews and purchase events fire (client + server).
- Admin dashboard (feature 13) reflects traffic without opening GA.
