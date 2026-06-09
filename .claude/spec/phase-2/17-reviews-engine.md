# 17 — Reviews engine + post-delivery requests

**Phase:** 2 · **Depends on:** A2, A3, feature 2 (PDP), feature 10 (WhatsApp), feature 12 (admin) · **Status:** To build

## Purpose
Manage testimonials and solicit reviews after delivery.

## Build
- Admin **Testimonials** module: text, source tag, rating, optional reel embed, **approve / feature** toggles.
- Public reviews on PDP (already consumed by feature 2).
- **Post-delivery WhatsApp** asking for a review (fires on `delivered`).
- Aggregate badges ("Rated 4.5 on Amazon") linking out — **not verbatim copies**.

## Data
`reviews` (`is_approved`, `is_featured`, `source`, `reel_url`, `rating`, `body`, `product_id`).

## API
- Admin server actions to create/approve/feature reviews.
- On order transition to `delivered`, send a review-request WhatsApp (feature 10).

## Tech notes
- Only `is_approved` reviews are public (RLS, A3).
- Aggregate ratings link to the source platform; **do not copy third-party reviews verbatim** (compliance).

## Acceptance
- Approved reviews show on the PDP; featured ones can be surfaced on home.
- Delivered orders trigger exactly one review request.
- No third-party reviews are copied verbatim.
