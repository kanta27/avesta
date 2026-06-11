import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { formatPaiseINR } from "@/lib/format";
import type { TablesInsert } from "@/lib/supabase";

/**
 * Server-side discount engine (feature 8).
 *
 * GUARDRAIL (conventions.md): ALL discount validation is server-side. The cart /
 * checkout discount field is UX only — the client never sends a money amount, and
 * even if it did we ignore it. Every discount is recomputed here from the code row
 * in `discount_codes`, exactly like the re-pricer recomputes prices from products.
 *
 * Two entry points:
 *   - validateAndApply() — called at create-order. Validates a code against the DB
 *     and computes the discount (capped at subtotal so the total can never go
 *     negative). Writes NOTHING — no redemption, no used_count change.
 *   - redeemOnPaid() — called at the created→paid transition (the SINGLE winner
 *     point shared with the receipt). Atomically inserts the redemption row and
 *     increments used_count via the redeem_discount() RPC. Race-safe + idempotent.
 *
 * Money is integer paise throughout (conventions.md) — no floats.
 */

/** A successful validation: the computed discount for this code on this cart. */
export interface DiscountApplied {
  ok: true;
  /** Discount amount in paise, already capped at subtotal (never exceeds it). */
  discount_paise: number;
  /** True only for `free_shipping` codes — the route zeroes shipping. */
  free_shipping: boolean;
  /** The canonical (normalized) code, for storing on the order. */
  code: string;
  /** The code row's id, handy for callers; redemption looks up by code regardless. */
  code_id: string;
}

/** A rejection: `reason` is a clear, user-facing message for the checkout UI. */
export interface DiscountRejected {
  ok: false;
  reason: string;
}

export type DiscountResult = DiscountApplied | DiscountRejected;

export interface ValidateAndApplyInput {
  /** The raw code as typed by the customer (any case / surrounding space). */
  code: string;
  /** Normalized 10-digit phone (per checkout validation) — for per_phone_limit. */
  phone: string;
  /** Server-computed cart subtotal in paise — the basis for percent / min-order. */
  subtotalPaise: number;
}

/** Normalize a code the same way on lookup and on storage: trim + uppercase. */
export function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Validate a discount code against the DB and compute its effect on this cart.
 *
 * Validation runs in a fixed order so each failure maps to one clear message:
 * not found → inactive → not yet active → expired → below min order → usage limit
 * reached → already used by this phone. Returns the computed (subtotal-capped)
 * discount on success, or `{ ok:false, reason }` on any failure.
 *
 * Reads use the service-role admin client: `discount_codes` /
 * `discount_redemptions` are RLS deny-all to public, and this is trusted server
 * code validating already-normalized input.
 */
export async function validateAndApply(
  input: ValidateAndApplyInput,
): Promise<DiscountResult> {
  const code = normalizeCode(input.code);
  if (!code) return { ok: false, reason: "Enter a discount code." };

  const admin = createAdminClient();

  // 1. Look the code up. Codes are stored normalized (see seed), so an exact match
  //    on the normalized input is correct.
  const { data: row, error } = await admin
    .from("discount_codes")
    .select(
      "id, code, kind, value_paise, value_pct, min_order_paise, usage_limit, used_count, per_phone_limit, starts_at, expires_at, is_active",
    )
    .eq("code", code)
    .maybeSingle();

  if (error) {
    // A lookup failure is not a user error — fail closed (no discount) with a
    // generic message rather than charging the wrong amount.
    return { ok: false, reason: "Could not check that code. Please try again." };
  }
  if (!row) {
    return { ok: false, reason: "This code isn't valid." };
  }

  // 2. Active flag.
  if (row.is_active === false) {
    return { ok: false, reason: "This code is no longer active." };
  }

  // 3. Validity window. `now` is the single reference instant for both bounds.
  const now = Date.now();
  if (row.starts_at && new Date(row.starts_at).getTime() > now) {
    return { ok: false, reason: "This code isn't active yet." };
  }
  if (row.expires_at && new Date(row.expires_at).getTime() < now) {
    return { ok: false, reason: "This code has expired." };
  }

  // 4. Minimum-order threshold (subtotal, pre-discount).
  const minOrder = row.min_order_paise ?? 0;
  if (input.subtotalPaise < minOrder) {
    return {
      ok: false,
      reason: `Add ${formatPaiseINR(
        minOrder - input.subtotalPaise,
      )} more to use this code (minimum order ${formatPaiseINR(minOrder)}).`,
    };
  }

  // 5. Global usage limit. NULL limit = unlimited.
  if (row.usage_limit != null && (row.used_count ?? 0) >= row.usage_limit) {
    return { ok: false, reason: "This code has reached its usage limit." };
  }

  // 6. Per-phone limit: how many times THIS phone has already redeemed THIS code.
  //    A NULL per_phone_limit means unlimited per phone.
  if (row.per_phone_limit != null) {
    const { count, error: countError } = await admin
      .from("discount_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("code_id", row.id)
      .eq("phone", input.phone);

    if (countError) {
      return {
        ok: false,
        reason: "Could not check that code. Please try again.",
      };
    }
    if ((count ?? 0) >= row.per_phone_limit) {
      return { ok: false, reason: "You've already used this code." };
    }
  }

  // 7. Compute the discount by kind, then CAP at subtotal so the total can never
  //    go negative (overflow guard).
  let discount_paise = 0;
  let free_shipping = false;

  switch (row.kind) {
    case "percent": {
      const pct = Number(row.value_pct ?? 0);
      discount_paise = Math.floor((input.subtotalPaise * pct) / 100);
      break;
    }
    case "flat": {
      discount_paise = row.value_paise ?? 0;
      break;
    }
    case "free_shipping": {
      // No line discount; the route zeroes shipping when this is true.
      free_shipping = true;
      discount_paise = 0;
      break;
    }
    default: {
      // A code with an unknown kind is misconfigured — fail closed.
      return { ok: false, reason: "This code isn't valid." };
    }
  }

  // Cap: discount never exceeds the subtotal.
  discount_paise = Math.max(0, Math.min(discount_paise, input.subtotalPaise));

  return {
    ok: true,
    discount_paise,
    free_shipping,
    code: row.code,
    code_id: row.id,
  };
}

export interface RedeemOnPaidInput {
  /** The paid order's uuid. */
  orderId: string;
  /** The code stored on the order (already normalized at create-order). */
  code: string;
  /** The order's customer phone (orders.customer_phone is non-null) — recorded
   *  on the redemption so per_phone_limit can count it. */
  phone: string;
}

/**
 * Record a redemption for a freshly-paid order, ATOMICALLY.
 *
 * Called from exactly ONE place per payment — the winner of the conditional
 * created→paid UPDATE in /confirm OR the Razorpay webhook (the loser updates 0
 * rows and never calls in). So this runs exactly once per order: idempotent across
 * {confirm, webhook} with no dedupe column, the same guarantee the receipt relies
 * on.
 *
 * Delegates the insert+increment to the redeem_discount() RPC, whose body is a
 * single transaction with an atomic conditional increment
 * (`used_count = used_count + 1 WHERE usage_limit IS NULL OR used_count <
 * usage_limit`). Two concurrent paids on a usage_limit=1 code therefore cannot
 * both redeem: the second's UPDATE matches 0 rows and the RPC returns false.
 *
 * OVER-LIMIT-AT-PAID edge: the code passed validation at create-order and the
 * customer was already charged the discounted total. If the last slot was taken in
 * between, the RPC returns false — we DO NOT reverse or re-charge the paid order
 * (strictly worse than honoring one extra discount). We log it for admin
 * reconciliation and move on; money stays correct, only the counter under-counts
 * in that rare window.
 *
 * NON-FATAL: never throws. A redemption failure must not fail an already-paid
 * order (and the status flip already committed, so a webhook retry won't re-run
 * this — best-effort with logging is the right tradeoff here).
 */
export async function redeemOnPaid(
  input: RedeemOnPaidInput,
): Promise<{ redeemed: boolean }> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("redeem_discount", {
      p_code: normalizeCode(input.code),
      p_order_id: input.orderId,
      p_phone: input.phone,
    });

    if (error) {
      console.error(
        `[discount] redeem_discount RPC failed (non-fatal) — order ${input.orderId}, code ${input.code}:`,
        error,
      );
      return { redeemed: false };
    }

    if (data === false) {
      // Passed validation at create-order but over-limit at the paid moment.
      console.warn(
        `[discount] code "${input.code}" oversold — order ${input.orderId} paid with the discount but the usage limit was already reached; no redemption recorded.`,
      );
      return { redeemed: false };
    }

    return { redeemed: true };
  } catch (err) {
    console.error(
      `[discount] redeemOnPaid threw (non-fatal) — order ${input.orderId}, code ${input.code}:`,
      err,
    );
    return { redeemed: false };
  }
}

// =============================================================================
// Admin CMS (feature 12, module 3) — create + list over `discount_codes`.
//
// Same server-only + service-role surface as the engine above; callers are the
// admin server actions, which gate on requireAdmin() first. Creation reuses
// `normalizeCode` so admin-created codes store identically to seeded ones and
// match the validator's exact-match lookup.
// =============================================================================

/** The three discount kinds (matches the A2 check constraint). */
export type DiscountKind = "percent" | "flat" | "free_shipping";

/** A discount code row shaped for the admin list. */
export interface DiscountCodeListItem {
  id: string;
  code: string;
  kind: DiscountKind;
  valuePct: number | null;
  valuePaise: number | null;
  minOrderPaise: number;
  usageLimit: number | null;
  usedCount: number;
  perPhoneLimit: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string | null;
}

/** All discount codes, newest first. */
export async function listDiscountCodes(): Promise<DiscountCodeListItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("discount_codes")
    .select(
      "id, code, kind, value_pct, value_paise, min_order_paise, usage_limit, used_count, per_phone_limit, starts_at, expires_at, is_active, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list discount codes: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    code: row.code,
    kind: row.kind as DiscountKind,
    valuePct: row.value_pct,
    valuePaise: row.value_paise,
    minOrderPaise: row.min_order_paise ?? 0,
    usageLimit: row.usage_limit,
    usedCount: row.used_count ?? 0,
    perPhoneLimit: row.per_phone_limit,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
  }));
}

/** The validated payload for creating a discount code (money in paise). */
export interface CreateDiscountInput {
  code: string;
  kind: DiscountKind;
  value_pct: number | null;
  value_paise: number | null;
  min_order_paise: number;
  usage_limit: number | null;
  per_phone_limit: number | null;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
}

/**
 * Create a discount code. The code is normalized (trim + uppercase) so it stores
 * exactly as the validator looks it up. Unique-violation on `code` surfaces as a
 * Postgres 23505 for the action to translate.
 */
export async function createDiscountCode(
  input: CreateDiscountInput,
): Promise<{ id: string }> {
  const admin = createAdminClient();

  const row: TablesInsert<"discount_codes"> = {
    code: normalizeCode(input.code),
    kind: input.kind,
    value_pct: input.kind === "percent" ? input.value_pct : null,
    value_paise: input.kind === "flat" ? input.value_paise : null,
    min_order_paise: input.min_order_paise,
    usage_limit: input.usage_limit,
    per_phone_limit: input.per_phone_limit,
    starts_at: input.starts_at,
    expires_at: input.expires_at,
    is_active: input.is_active,
  };

  const { data, error } = await admin
    .from("discount_codes")
    .insert(row)
    .select("id")
    .single();

  if (error) throw error;
  return { id: data.id };
}

/**
 * Activate / deactivate a discount code (the list's kill switch). Flips the
 * existing `is_active` column — no schema change. A deactivated code fails the
 * validator's `is_active === false` check, so it stops working immediately at
 * checkout without being deleted.
 */
export async function setDiscountActive(
  id: string,
  isActive: boolean,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("discount_codes")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw error;
}
