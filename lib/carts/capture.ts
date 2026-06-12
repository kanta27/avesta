import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase";
import type { PricedItem } from "@/lib/checkout/pricing";

/**
 * Capture (upsert) the shopper's cart at checkout START — feature 18.
 *
 * Called from `/api/checkout/create-order` once the cart is re-priced and the
 * phone is validated, so it always records SERVER-priced items (never client
 * money) keyed by the normalized phone. The carts table holds PII and is fully
 * RLS-locked (deny-all to anon); this runs through the service-role client only.
 *
 * ONE row per phone: `carts.phone` has no DB unique constraint, so we upsert by
 * hand — update the phone's existing (most-recent) row back to a fresh `active`
 * cart, or insert one if none exists. Re-opening checkout RESETS the row to
 * `active` with `recovery_sent=false`: a new purchase attempt is a new chance to
 * recover, and the cron's per-active-cart `recovery_sent` guard still ensures at
 * most one nudge per active session.
 *
 * NON-FATAL: never throws. Cart capture is best-effort analytics/recovery — a
 * failure here must never fail the order the shopper is trying to place, exactly
 * like the receipt/redemption/lead hooks elsewhere in checkout.
 */
export async function captureCart(input: {
  phone: string;
  email: string | null;
  items: PricedItem[];
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const now = new Date().toISOString();

    const row = {
      phone: input.phone,
      email: input.email,
      items: input.items as unknown as Json,
      status: "active" as const,
      last_seen_at: now,
      recovery_sent: false,
    };

    // Find the phone's existing cart row (any status) to keep it to one row.
    const { data: existing, error: selectError } = await admin
      .from("carts")
      .select("id")
      .eq("phone", input.phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selectError) {
      console.error(
        `[carts] capture select failed (non-fatal) — ${input.phone}:`,
        selectError,
      );
      return;
    }

    if (existing) {
      const { error: updateError } = await admin
        .from("carts")
        .update(row)
        .eq("id", existing.id);
      if (updateError) {
        console.error(
          `[carts] capture update failed (non-fatal) — ${input.phone}:`,
          updateError,
        );
      }
      return;
    }

    const { error: insertError } = await admin.from("carts").insert(row);
    if (insertError) {
      console.error(
        `[carts] capture insert failed (non-fatal) — ${input.phone}:`,
        insertError,
      );
    }
  } catch (err) {
    console.error(
      `[carts] captureCart threw (non-fatal) — ${input.phone}:`,
      err,
    );
  }
}
