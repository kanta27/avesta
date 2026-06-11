"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createDiscountCode, setDiscountActive } from "@/lib/discounts";

/**
 * Discount-code server actions (feature 12, module 3).
 *
 * requireAdmin() FIRST, then writes via the service-role data layer in
 * `lib/discounts.ts`. Money is integer paise; the form converts ₹ before submit.
 */

export type DiscountActionResult = { ok: true } | { ok: false; error: string };

const optionalCount = z.preprocess(
  (v) => (v === "" || v === undefined ? null : v),
  z.number().int().min(1).max(1000000).nullable(),
);

const optionalDateTime = z.preprocess(
  (v) => (v == null || v === "" ? null : v),
  z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date.")
    .nullable(),
);

const createSchema = z
  .object({
    code: z.string().trim().min(1, "Code is required.").max(60),
    kind: z.enum(["percent", "flat", "free_shipping"]),
    value_pct: z.preprocess(
      (v) => (v === "" || v === undefined ? null : v),
      z.number().min(0).max(100).nullable(),
    ),
    value_paise: z.preprocess(
      (v) => (v === "" || v === undefined ? null : v),
      z.number().int().min(0).max(100000000).nullable(),
    ),
    min_order_paise: z.number().int().min(0).max(100000000).default(0),
    usage_limit: optionalCount,
    per_phone_limit: optionalCount,
    starts_at: optionalDateTime,
    expires_at: optionalDateTime,
    is_active: z.boolean(),
  })
  .refine(
    (d) => d.kind !== "percent" || (d.value_pct != null && d.value_pct > 0),
    { message: "Enter a percentage greater than 0.", path: ["value_pct"] },
  )
  .refine(
    (d) => d.kind !== "flat" || (d.value_paise != null && d.value_paise > 0),
    { message: "Enter an amount greater than 0.", path: ["value_paise"] },
  );

export async function createDiscountAction(
  raw: unknown,
): Promise<DiscountActionResult> {
  await requireAdmin();

  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const d = parsed.data;

  try {
    await createDiscountCode({
      code: d.code,
      kind: d.kind,
      value_pct: d.value_pct,
      value_paise: d.value_paise,
      min_order_paise: d.min_order_paise,
      usage_limit: d.usage_limit,
      per_phone_limit: d.per_phone_limit,
      starts_at: d.starts_at,
      expires_at: d.expires_at,
      is_active: d.is_active,
    });
    revalidatePath("/admin/discounts");
    return { ok: true };
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "23505") {
      return { ok: false, error: "That code already exists — choose another." };
    }
    const message = err instanceof Error ? err.message : "Could not create code.";
    return { ok: false, error: message };
  }
}

/** Activate / deactivate a discount code (the list kill switch). */
export async function setDiscountActiveAction(
  id: string,
  isActive: boolean,
): Promise<DiscountActionResult> {
  await requireAdmin();
  try {
    await setDiscountActive(id, isActive);
    revalidatePath("/admin/discounts");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update code.";
    return { ok: false, error: message };
  }
}
