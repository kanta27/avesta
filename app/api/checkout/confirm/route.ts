import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayment } from "@/lib/payments";
import { sendOrderConfirmation } from "@/lib/receipts/order-confirmation";
import { redeemOnPaid } from "@/lib/discounts";
import type { PricedItem } from "@/lib/checkout/pricing";

// Uses node:crypto (via the payment layer) + the service-role client.
export const runtime = "nodejs";

/**
 * POST /api/checkout/confirm
 *
 * The browser's post-payment callback. Verifies the gateway signature (the REAL
 * verification path — the mock mirrors Razorpay's HMAC), then idempotently marks
 * the order `paid`. This and the webhook (source of truth) both reconcile the
 * same payment: whichever lands first performs the `created → paid` transition;
 * the other is a no-op. Neither ever creates an order.
 */
const confirmSchema = z.object({
  providerOrderId: z.string().min(1).max(120),
  paymentId: z.string().min(1).max(120),
  signature: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid confirmation." }, { status: 400 });
  }
  const { providerOrderId, paymentId, signature } = parsed.data;

  // 1. Verify the signature BEFORE trusting anything. A bad signature never
  //    touches the order. Signature = HMAC(providerOrderId|paymentId), so it is
  //    bound to this exact order — a stolen pair can't mark a different order.
  if (!verifyPayment({ providerOrderId, paymentId, signature })) {
    return NextResponse.json(
      { error: "Payment could not be verified." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // 2. Idempotent transition: only a still-`created` order flips to `paid`. A
  //    replayed confirm — or a webhook that already won the race — updates 0
  //    rows. Dedupe is implicit: the row is keyed by razorpay_order_id and only
  //    transitions once.
  const { data: updated, error: updateError } = await admin
    .from("orders")
    .update({ status: "paid", razorpay_payment_id: paymentId })
    .eq("razorpay_order_id", providerOrderId)
    .eq("status", "created")
    .select(
      "id, order_number, name, email, items, total_paise, created_at, discount_code, customer_phone",
    );

  if (updateError) {
    return NextResponse.json(
      { error: "Could not confirm your order. Please contact support." },
      { status: 500 },
    );
  }

  if (updated && updated.length > 0) {
    // We performed the transition (the winner). This is the ONE place the
    // browser path marks an order paid.
    const order = updated[0];

    // Fire the order confirmation (email receipt now; WhatsApp in feature 10).
    // The webhook carries an identical hook for the closed-tab case. Only the
    // path that actually transitions the order reaches here, so the receipt is
    // sent EXACTLY ONCE regardless of which of {confirm, webhook} wins. The send
    // is non-fatal and never throws — it cannot fail the order.
    await sendOrderConfirmation({
      id: order.id,
      order_number: order.order_number,
      name: order.name,
      email: order.email,
      items: (order.items as unknown as PricedItem[]) ?? [],
      total_paise: order.total_paise,
      created_at: order.created_at,
    });

    // Record the discount redemption — atomically and exactly once. Only the
    // transition winner reaches here, so this runs once per paid order (the same
    // guarantee the receipt relies on). Non-fatal: a redemption failure never
    // un-pays the order. Skipped when no code was applied.
    if (order.discount_code) {
      await redeemOnPaid({
        orderId: order.id,
        code: order.discount_code,
        phone: order.customer_phone,
      });
    }

    return NextResponse.json({
      id: order.id,
      orderNumber: order.order_number,
      status: "paid",
    });
  }

  // 3. Zero rows updated — either already paid (idempotent no-op; the webhook
  //    likely won) or an unknown provider order. Read current state to tell
  //    them apart and return a stable success for an already-paid order.
  const { data: existing } = await admin
    .from("orders")
    .select("id, order_number, status")
    .eq("razorpay_order_id", providerOrderId)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Already paid (or beyond): idempotent success, no second state change and no
  // duplicate confirmation message. We still return the UUID so the closed-tab
  // / replayed-confirm client can land on the right confirmation page.
  return NextResponse.json({
    id: existing.id,
    orderNumber: existing.order_number,
    status: existing.status,
  });
}
