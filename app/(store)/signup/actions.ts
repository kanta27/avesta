"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signupSchema } from "@/lib/auth/validation";
import { safeNextPath } from "@/lib/auth/safe-next";
import type { AuthState } from "../login/actions";

/**
 * Storefront customer signup (instant login, NO email verification).
 *
 * Flow:
 *   1. Create the auth user with the service-role admin API, `email_confirm:
 *      true`. Pre-confirming server-side means the account is usable immediately
 *      regardless of the project's "Confirm email" setting — no verification
 *      email, no waiting (per product decision).
 *   2. Upsert the matching `profiles` row (service-role; profiles has no public
 *      insert policy).
 *   3. Sign the user in with the SSR client so session cookies are set, then
 *      redirect to the sanitized `next` target.
 *
 * Re-validates everything server-side; the service-role client is only reached
 * after the input passes `signupSchema`.
 */
export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }
  const { name, email, password } = parsed.data;

  const admin = createAdminClient();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

  if (createError || !created.user) {
    // The overwhelmingly common cause is a duplicate email. Keep the message
    // actionable without confirming account existence beyond what a login
    // attempt would already reveal.
    return {
      error:
        "We couldn't create that account. The email may already be registered — try signing in.",
    };
  }

  // Mirror the core fields onto the profile row the account page edits.
  const { error: profileError } = await admin.from("profiles").upsert(
    { id: created.user.id, name, email },
    { onConflict: "id" },
  );
  if (profileError) {
    // The auth user exists; the profile can be re-created on first save. Don't
    // hard-fail signup over this — fall through to sign-in.
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    // Account created but the auto-login failed — send them to log in manually,
    // preserving where they were headed.
    redirect(
      `/login?next=${encodeURIComponent(safeNextPath(formData.get("next")))}`,
    );
  }

  redirect(safeNextPath(formData.get("next")));
}
