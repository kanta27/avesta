import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAllowedAdminEmail } from "./admin-allowlist";
import type { User } from "@supabase/supabase-js";

/**
 * Server-side admin gate. Call this at the top of EVERY admin server action,
 * route handler, and protected admin page — do NOT rely on `middleware.ts`
 * alone, which can be bypassed by a direct POST to a server action.
 *
 * It uses `getUser()` (not `getSession()`), which revalidates the JWT against
 * Supabase Auth, so a forged/expired cookie fails. If there is no valid session
 * or the email is not allow-listed, it redirects to `/admin/login` and never
 * returns.
 *
 * After the gate passes, privileged mutations should use the service-role
 * client (`@/lib/supabase/admin`, `server-only`) — never client code.
 *
 * @returns the authenticated, allow-listed admin user.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAllowedAdminEmail(user.email)) {
    redirect("/admin/login");
  }

  return user;
}
