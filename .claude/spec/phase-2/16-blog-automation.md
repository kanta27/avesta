# 16 — Blog + admin editor + automation endpoint

**Phase:** 2 · **Depends on:** A2, A3, A6, feature 14 (SEO) · **Status:** To build

## Purpose
Content marketing surface plus a secured endpoint so an AutoSEO agent can submit drafts (admin approves before publish).

## Build
- Public `/blog` and `/blog/[slug]`.
- Admin rich-text / markdown editor with workflow **draft → review → publish**.
- `POST /api/automation/blog` secured by `AUTOMATION_API_TOKEN` (bearer) for agent-submitted drafts.

## Data
`blog_posts`. Agent drafts land with `source='automation'`, `status='review'` — **never auto-published**.

## API
- `POST /api/automation/blog` — bearer `AUTOMATION_API_TOKEN`; body `{ title, body_md, excerpt, tags, seo_title, seo_description, cover_image }`; inserts a `review` post with `source='automation'`. Reject without/with wrong token (401).
- Public routes read `published` posts only (RLS).

## UI
- Blog index + post page; render `body_md` → HTML; **Article** JSON-LD (feature 14).
- Admin list filterable by status/source; editor to edit and transition status.

## Tech notes
- Render markdown safely (sanitize). Structure for search intent (e.g. "best natural supplement for cholesterol India").
- Set `published_at` on transition to `published`.

## Acceptance
- Agent can POST a draft → it appears in admin as `review`.
- Admin can publish; published post is public + indexable with Article schema.
- Wrong/missing automation token is rejected.
