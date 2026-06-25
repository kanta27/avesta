"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/auth/validation";
import { safeNextPath } from "@/lib/auth/safe-next";

export type AuthState = { error?: string };

/**
 * Storefront customer login (email + password). On success the session cookies
 * are written by the SSR client and we redirect to the sanitized `next` target
 * (defaults to `/account`). A wrong email or password returns a single, generic
 * message — we never reveal whether the email exists.
 */
export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Invalid email or password." };
  }

  redirect(safeNextPath(formData.get("next")));
}
