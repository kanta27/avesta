import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase";

export type Profile = Tables<"profiles">;

/**
 * The current storefront customer, or null. Uses `getUser()` (not
 * `getSession()`) so the JWT is revalidated against Supabase Auth — a forged or
 * expired cookie returns null rather than a fake user. Safe in any server
 * component / action / route handler.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Gate a storefront page/action behind login. If there is no valid session,
 * redirect to `/login?next=<where they were headed>` so the user lands back
 * where they started after signing in. Returns the authenticated user.
 *
 * NOTE: this is authentication only (is the visitor signed in), NOT the admin
 * authorization gate — admin pages use `requireAdmin()`.
 */
export async function requireUser(nextPath = "/account"): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

/**
 * Read the signed-in user's own profile row. Runs under RLS with the visitor's
 * session (the `profiles_self_read` policy restricts it to `auth.uid() = id`),
 * so no service-role access is needed. Returns null if the profile row is
 * somehow absent (e.g. a user created before the profile was written).
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data;
}
