import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Browser (client-component) Supabase client, typed against the A2 schema.
 * Uses the public anon/publishable key — every access is constrained by RLS,
 * so this is safe to ship to the browser. Never put the service-role key here.
 */
export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
