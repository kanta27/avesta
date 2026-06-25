"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { changePasswordSchema } from "@/lib/auth/validation";

export type PasswordState = { ok?: boolean; error?: string };

/**
 * Change the signed-in admin's password. Re-gates with `requireAdmin()` (never
 * trust the layout alone for a mutation), then updates the CURRENT session
 * user's password via the SSR client — there's no way to target another user.
 */
export async function changeAdminPasswordAction(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  await requireAdmin();

  const parsed = changePasswordSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { error: "Could not update your password. Please try again." };
  }

  return { ok: true };
}
