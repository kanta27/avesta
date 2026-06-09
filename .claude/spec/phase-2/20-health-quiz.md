# 20 — 60-second health-concern quiz

**Phase:** 2 · **Depends on:** A2, A3, feature 9 (leads), feature 1 (products) · **Status:** To build

## Purpose
Guide undecided visitors to a product and capture a consented lead.

## Build
`/quiz` — multi-step flow → recommendation + lead capture.

## Data
Writes `leads` with `source_type='quiz'`, `quiz_answers` (jsonb), `recommended_product_id`.

## API
`POST /api/leads` (shared, feature 9) carrying quiz answers + recommended product; same consent handling.

## UI
- 5 quick questions (concern-first), progress indicator.
- Result screen: matched product (links to PDP) + offer (e.g. 10% off), with the same explicit unticked WhatsApp consent.

## Tech notes
- Recommendation logic maps answers → `concerns[]` → best-matching active product. Keep the mapping simple and data-driven (could live in config or be derived from product `concerns`).
- The quiz band on the homepage (`QuizBand`, from A1) links here.

## Acceptance
- Completing the quiz recommends a product and captures a consented lead with `quiz_answers` stored.
