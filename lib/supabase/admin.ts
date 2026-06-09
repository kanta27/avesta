import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env.server";
import type { Database } from "./types";

/**
 * Service-role Supabase client — BYPASSES RLS. Server-only.
 *
 * The `server-only` import above makes the build fail if this module is ever
 * imported into client code, so the service-role key can never reach the browser
 * (guardrail: SUPABASE_SERVICE_ROLE_KEY stays server-only).
 *
 * Use this only for trusted server work that must skip RLS — webhooks, admin
 * mutations, order creation after payment. Never for handling untrusted input
 * without re-validating it server-side first.
 */
export function createAdminClient() {
  const env = serverEnv();

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
