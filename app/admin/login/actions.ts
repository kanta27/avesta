"use server";

import { createClient } from "@/lib/supabase/server";
import { isAllowedAdminEmail } from "@/lib/auth/admin-allowlist";
import { publicEnv } from "@/lib/env";

export type LoginState = {
  status: "idle" | "sent" | "error";
  message?: string;
};

/**
 * Request a magic-link sign-in (A6).
 *
 * Pre-gates on the allow-list BEFORE sending anything, so the app never emails
 * magic links to arbitrary addresses (no spam relay, no stray auth users). To
 * avoid leaking who is on the allow-list, a non-allow-listed address gets the
 * SAME generic "if authorized, a link is on its way" response as a real one.
 */
export async function requestMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@")) {
    return { status: "error", message: "Enter a valid email address." };
  }

  // Not allow-listed → behave exactly as success (no enumeration), send nothing.
  if (!isAllowedAdminEmail(email)) {
    return {
      status: "sent",
      message: "If that address is authorized, a sign-in link is on its way.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/admin/auth/callback`,
      // Single-admin bootstrap: create the auth user on first sign-in. Safe
      // because only allow-listed emails ever reach this call.
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return {
    status: "sent",
    message: "If that address is authorized, a sign-in link is on its way.",
  };
}
