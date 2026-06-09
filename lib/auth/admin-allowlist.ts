/**
 * Admin allow-list — the single source of authz for the admin area (A6).
 *
 * Reads `ADMIN_ALLOWED_EMAILS` (a comma-separated list) and answers "is this
 * email allowed into /admin?". Authz is by email allow-list only; there is no
 * DB role table at launch (per spec A6).
 *
 * DELIBERATE EXCEPTION to the "read env only through lib/env*.ts" convention:
 * this reads `process.env.ADMIN_ALLOWED_EMAILS` directly rather than via
 * `serverEnv()`. Two reasons:
 *   1. `serverEnv()` hard-requires `SUPABASE_SERVICE_ROLE_KEY`, and route-gating
 *      in `middleware.ts` must not depend on the service-role key being present.
 *   2. This module is imported by middleware (edge runtime); keeping it free of
 *      the `server-only` marker and of the service-role schema avoids edge
 *      bundling surprises.
 *
 * It stays safe in two ways:
 *   - `ADMIN_ALLOWED_EMAILS` is NOT a `NEXT_PUBLIC_*` var, so Next.js never
 *     inlines it into the client bundle — it is server/edge-only at runtime.
 *   - The parser FAILS CLOSED: a missing/empty var yields an empty list, so
 *     every email is denied rather than allowed.
 */

/** Parse the comma-separated allow-list into normalized (trimmed, lowercased) emails. */
export function adminAllowList(): string[] {
  return (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/** True only if `email` is non-empty and present in the allow-list. Fails closed. */
export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminAllowList().includes(email.trim().toLowerCase());
}
