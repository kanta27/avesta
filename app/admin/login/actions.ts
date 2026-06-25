"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAllowedAdminEmail } from "@/lib/auth/admin-allowlist";

export type LoginState = {
  error?: string;
};

/**
 * Admin sign-in with email + password (A6, credentials-only — no magic link,
 * no email verification step).
 *
 * Two-layer authz:
 *   1. Pre-gate on the allow-list BEFORE touching Supabase Auth, so a valid
 *      Supabase user that isn't allow-listed can never open an admin session.
 *   2. After `signInWithPassword` succeeds, RE-CHECK the resolved session email
 *      against the allow-list and sign out if it slipped through.
 *
 * Every failure returns the same generic message so we never reveal whether an
 * email exists or is allow-listed.
 */
export async function signInAdmin(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  // Layer 1 — allow-list pre-gate (generic message, no enumeration).
  if (!isAllowedAdminEmail(email)) {
    return { error: "Invalid email or password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Invalid email or password." };
  }

  // Layer 2 — re-check the resolved session against the allow-list.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAllowedAdminEmail(user?.email)) {
    await supabase.auth.signOut();
    return { error: "Invalid email or password." };
  }

  redirect("/admin");
}
