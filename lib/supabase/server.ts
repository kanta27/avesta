import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";

/**
 * Server-side Supabase client (Server Components, Route Handlers, Server Actions),
 * typed against the A2 schema. Uses the public anon/publishable key and reads the
 * auth session from cookies, so reads/writes still run under RLS — use this for
 * public reads and any request made on behalf of the visitor.
 *
 * For privileged writes that must bypass RLS, use the service-role client in
 * `./admin` (server-only) instead.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy .env.example to .env.local and fill them in.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `setAll` is called from a Server Component where mutating cookies
          // is not allowed. Safe to ignore when middleware refreshes sessions.
        }
      },
    },
  });
}
