"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/customer";
import { createAdminClient } from "@/lib/supabase/admin";
import { profileUpdateSchema } from "@/lib/auth/validation";

export type ProfileState = { ok?: boolean; error?: string };

/**
 * Save the signed-in customer's profile (name, phone, saved address, WhatsApp
 * consent). Re-gates with `requireUser()` and writes ONLY the caller's own row
 * (`id = user.id`) via the service-role client — using upsert so a profile that
 * is somehow missing is created rather than silently dropped.
 */
export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser("/account");

  const parsed = profileUpdateSchema.safeParse({
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    address: {
      line1: formData.get("line1") ?? "",
      line2: formData.get("line2") ?? "",
      city: formData.get("city") ?? "",
      state: formData.get("state") ?? "",
      pincode: formData.get("pincode") ?? "",
      country: "India",
    },
    consentWhatsapp: formData.get("consentWhatsapp") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }
  const { name, phone, address, consentWhatsapp } = parsed.data;

  // Collapse a blank address to null rather than storing an all-empty object.
  const hasAddress = Boolean(
    address.line1 || address.city || address.state || address.pincode,
  );

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      name,
      phone: phone ?? null,
      default_address: hasAddress ? address : null,
      consent_whatsapp: consentWhatsapp,
      // Stamp consent only when granted; clear it when withdrawn (DPDP).
      consent_at: consentWhatsapp ? new Date().toISOString() : null,
    },
    { onConflict: "id" },
  );
  if (error) {
    return { error: "Could not save your profile. Please try again." };
  }

  revalidatePath("/account");
  return { ok: true };
}
