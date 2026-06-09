import { z } from "zod";

/**
 * Public environment (client-safe).
 *
 * Only `NEXT_PUBLIC_*` variables live here. Next.js inlines these into the
 * client bundle, so they must reference `process.env.NEXT_PUBLIC_*` as static
 * literals (no dynamic key access) and must never hold a secret.
 *
 * This module is importable from both client and server code. Server-only
 * secrets live in `./env.server` (guarded by `server-only`) so they can never
 * be bundled to the browser.
 *
 * Validation runs at module load: if a required public var is missing or
 * malformed the app fails fast with a clear, aggregated error.
 */
const publicSchema = z.object({
  // Canonical site origin — used for absolute URLs, SEO, redirects.
  NEXT_PUBLIC_SITE_URL: z.url(),
  // Supabase project URL + anon/publishable key. Public-safe: every access is
  // constrained by RLS. REQUIRED — the app cannot talk to the DB without them.
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // Analytics — optional until the analytics/pixel features are wired up.
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
});

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
}

const parsed = publicSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
});

if (!parsed.success) {
  throw new Error(
    "❌ Invalid public environment variables. Copy .env.example to " +
      ".env.local and fill in the required values:\n" +
      formatIssues(parsed.error),
  );
}

export const publicEnv = parsed.data;
export type PublicEnv = typeof publicEnv;
