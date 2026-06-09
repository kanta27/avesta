# 21 — Gallery management + public gallery

**Phase:** 2 · **Depends on:** A2, A3, A6, feature 12 (admin) · **Status:** To build

## Purpose
Showcase product / lab / manufacturing imagery, managed by the client.

## Build
- Admin upload + manage module (categories: product / lab / manufacturing; sort order).
- Public gallery section/page.

## Data
`gallery_images` (`url`, `alt`, `category`, `sort`). Images in the `gallery` storage bucket (public read; signed-URL upload).

## API
Admin server actions for upload (signed URL) + CRUD + reorder. Public read via anon (RLS allows all gallery rows).

## UI
- Admin: drag/sort, category select, alt text, delete.
- Public: filterable gallery grid by category.

## Acceptance
- Uploaded images appear in the chosen category in admin and on the public site, in sort order.
