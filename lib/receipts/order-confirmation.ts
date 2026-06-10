import "server-only";

import { sendOrderReceiptEmail } from "@/lib/email/receipt";
import { sendOrderConfirmation as sendOrderConfirmationWhatsApp } from "@/lib/whatsapp";
import type { ConfirmationOrder } from "./types";

/**
 * Fire the order-confirmation receipt(s) for a freshly-paid order.
 *
 * IDEMPOTENCY: this is called from exactly ONE place per payment — the winner of
 * the conditional `created → paid` UPDATE in the confirm route OR the Razorpay
 * webhook (whichever lands first; the loser updates 0 rows and never calls in).
 * So the receipt is sent exactly once per order with no dedupe column needed.
 *
 * NON-FATAL: every send here is best-effort. This function never throws — a
 * failed or absent receipt must not fail the order.
 */
export async function sendOrderConfirmation(
  order: ConfirmationOrder,
): Promise<void> {
  try {
    // 1. Email receipt — built, but DORMANT until EMAIL_API_KEY is set. Logs
    //    "skipped (no key)" and returns when no key is present.
    await sendOrderReceiptEmail(order);

    // 2. WhatsApp confirmation (feature 10) — TRANSACTIONAL, fired regardless of
    //    marketing consent (it's purchase-tied). DORMANT until WHATSAPP_API_KEY:
    //    with no key it logs intent and returns non-fatally, exactly like the
    //    email send above. Never throws, so it cannot fail the order.
    await sendOrderConfirmationWhatsApp({
      order_number: order.order_number,
      total_paise: order.total_paise,
      customer_phone: order.customer_phone,
    });
  } catch (err) {
    // Defense in depth: the email path already swallows its own errors, but
    // guarantee the order flow can never be broken by a send.
    console.error(
      `[receipt] order-confirmation send failed (non-fatal) — order ${order.order_number}:`,
      err,
    );
  }
}
