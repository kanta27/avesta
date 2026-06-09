# 15 — B2B bulk-inquiry page

**Phase:** 1 · **Depends on:** A2, A3, feature 9 (leads pipeline), feature 12 (admin) · **Status:** To build

## Purpose
Capture wholesale interest (doctors / pharmacies / distributors) without building a portal yet.

## Build
`/for-professionals` page with an inquiry form. No portal / login / tiered pricing at launch (that's feature 25, Phase 3).

## Data
Writes `leads` with `source_type='b2b'` (name, phone, email, plus free-text needs; reuse `quiz_answers`/notes field or add to `source_page` context).

## API
`POST /api/leads` (shared with feature 9), tagged `b2b`.

## UI
Professional-facing copy; fields for org type, contact, volume interest. Same consent handling as feature 9.

## Acceptance
- Submissions land in the same **Leads** module, tagged **B2B**, and export in the CSV.
