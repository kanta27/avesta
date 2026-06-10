import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Flip a lead to converted when its phone places a paid order.
 *
 * Called from the SINGLE created→paid transition winner (the same one place that
 * sends the receipt and records the discount redemption — in BOTH /confirm and
 * the Razorpay webhook). Lead phones are normalized through the same checkout
 * `phoneSchema` as `orders.customer_phone`, so this is an exact-match update.
 *
 * Matches ANY unconverted lead with that phone (popup, newsletter, …) and stamps
 * the order id. The `converted = false` guard makes it idempotent — a re-run, or
 * a later order from the same phone, won't overwrite an already-recorded
 * conversion.
 *
 * NON-FATAL: never throws. A conversion-tracking failure must never un-pay or
 * fail an already-paid order — exactly like the receipt and redemption hooks it
 * sits beside.
 */
export async function markLeadConverted(input: {
  phone: string;
  orderId: string;
}): Promise<{ converted: number }> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("leads")
      .update({ converted: true, converted_order_id: input.orderId })
      .eq("phone", input.phone)
      .eq("converted", false)
      .select("id");

    if (error) {
      console.error(
        `[lead] markLeadConverted failed (non-fatal) — order ${input.orderId}:`,
        error,
      );
      return { converted: 0 };
    }
    return { converted: data?.length ?? 0 };
  } catch (err) {
    console.error(
      `[lead] markLeadConverted threw (non-fatal) — order ${input.orderId}:`,
      err,
    );
    return { converted: 0 };
  }
}
