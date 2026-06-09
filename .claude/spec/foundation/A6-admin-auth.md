# A6 — Admin auth

**Phase:** Foundation · **Depends on:** A1, A3, A4 · **Status:** To build

## Purpose
Gate `/admin` so only allow-listed staff can reach the CMS; all admin mutations run server-side with the service role.

## Build
- **Supabase Auth** — email magic-link (or password) login at `/admin/login`.
- **Middleware** (`middleware.ts`) protecting `/admin/*`: read the session, check the email against `ADMIN_ALLOWED_EMAILS` (comma list). Non-allow-listed or unauthenticated → redirect to `/admin/login`.
- Admin data mutations run in **server actions / route handlers** using the service-role client **after** the gate (A3).

## Data
Uses Supabase Auth users; authz by email allow-list (no DB role table needed at launch).

## API
- Login/logout via Supabase Auth helpers.
- Admin mutations are server actions guarded by a shared `requireAdmin()` that re-checks the session server-side (don't rely on middleware alone for mutations).

## Tech notes
- Middleware runs at the edge for redirects, but **every** mutating server action must independently call `requireAdmin()` — middleware can be bypassed by direct POSTs.
- `ADMIN_ALLOWED_EMAILS` is server-only env.

## Deps / env
`@supabase/ssr` (or auth-helpers). Env: `ADMIN_ALLOWED_EMAILS`, Supabase URL/keys.

## Acceptance
- `/admin` is unreachable without an allow-listed session; non-admins are redirected.
- A direct POST to an admin server action without a valid admin session is rejected.
