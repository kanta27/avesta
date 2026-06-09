import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. " +
        "Set them in .env.local (service-role key is secret — never commit it).",
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
