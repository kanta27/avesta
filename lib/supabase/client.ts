import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Browser (client-component) Supabase client, typed against the A2 schema.
 * Uses the public anon/publishable key — every access is constrained by RLS,
 * so this is safe to ship to the browser. Never put the service-role key here.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy .env.example to .env.local and fill them in.",
    );
  }

  return createBrowserClient<Database>(url, key);
}
