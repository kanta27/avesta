import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Flip the shopper's cart to a terminal "bought" status when their phone places
 * a paid order — feature 18 conversion flip.
 *
 * Called from the SINGLE created→paid transition winner (the same one place that
 * sends the receipt, records the discount redemption, and flips the lead — in
 * BOTH /confirm and the Razorpay webhook). The Razorpay webhook is the source of
 * truth; /confirm carries an identical hook for the closed-tab case. Only the
 * path that actually transitions the order reaches here, so this runs exactly
 * once per paid order.
 *
 * Status chosen from `recovery_sent`:
 *   - `recovery_sent = true`  → `recovered` (bought AFTER the nudge fired).
 *   - `recovery_sent = false` → `converted` (bought before any nudge).
 *
 * This is also what SUPPRESSES the nudge when a paid order lands before the cron
 * runs: a converted/recovered cart is no longer `active`, so the cron's
 * `status='active'` filter skips it (a second, independent backstop sits in the
 * cron itself — it checks for a paid order per phone before sending).
 *
 * Only matches a cart that is still `active`/`abandoned` (the `.in` guard), so a
 * re-run, or a later order from the same phone, won't churn an already-terminal
 * cart. NON-FATAL: never throws — a cart-tracking failure must never un-pay or
 * fail an already-paid order, exactly like the hooks it sits beside.
 */
export async function markCartConverted(input: {
  phone: string;
}): Promise<{ flipped: number }> {
  try {
    const admin = createAdminClient();

    // The phone's most-recent non-terminal cart decides converted vs recovered.
    const { data: cart, error: selectError } = await admin
      .from("carts")
      .select("id, recovery_sent")
      .eq("phone", input.phone)
      .in("status", ["active", "abandoned"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selectError) {
      console.error(
        `[carts] markCartConverted select failed (non-fatal) — ${input.phone}:`,
        selectError,
      );
      return { flipped: 0 };
    }
    if (!cart) return { flipped: 0 };

    const nextStatus = cart.recovery_sent ? "recovered" : "converted";

    // Re-assert the non-terminal guard in the update so a concurrent flip can't
    // clobber a terminal status.
    const { data, error: updateError } = await admin
      .from("carts")
      .update({ status: nextStatus })
      .eq("id", cart.id)
      .in("status", ["active", "abandoned"])
      .select("id");

    if (updateError) {
      console.error(
        `[carts] markCartConverted update failed (non-fatal) — ${input.phone}:`,
        updateError,
      );
      return { flipped: 0 };
    }
    return { flipped: data?.length ?? 0 };
  } catch (err) {
    console.error(
      `[carts] markCartConverted threw (non-fatal) — ${input.phone}:`,
      err,
    );
    return { flipped: 0 };
  }
}
