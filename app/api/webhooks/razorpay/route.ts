import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/payments";

// Uses node:crypto (via the payment layer) + the service-role client. Must run
// on Node.js so the RAW request body is available byte-for-byte.
export const runtime = "nodejs";

/**
 * POST /api/webhooks/razorpay
 *
 * The gateway's server-to-server notification — the SOURCE OF TRUTH for payment
 * status, and the path that reconciles an order when the browser closes before
 * `/confirm` runs. It is fully independent of the client.
 *
 * Critical details:
 *   - The signature is verified over the RAW request body bytes (NOT a
 *     re-serialized JSON object) using the webhook secret. We read `request.text()`
 *     before any parsing so a single re-encoded byte can't break verification.
 *   - It is idempotent: the `created → paid` transition is a conditional UPDATE
 *     keyed on `razorpay_order_id` + `status='created'`, so a Razorpay retry, or
 *     a `/confirm` that already won the race, updates 0 rows and is a no-op. No
 *     order is ever double-marked or double-created.
 *   - It acknowledges every VERIFIED delivery with 2xx (even no-ops) so the
 *     gateway stops retrying; only an unverifiable signature returns 4xx.
 */

/** Shape of the bits of a Razorpay `payment.captured` event we consume. */
interface RazorpayPaymentEntity {
  id?: string;
  order_id?: string;
  status?: string;
  amount?: number;
}
interface RazorpayWebhookEvent {
  event?: string;
  payload?: { payment?: { entity?: RazorpayPaymentEntity } };
}

export async function POST(request: Request) {
  // 1. RAW body first — verification must run over the exact received bytes.
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  // 2. Verify over the raw body. An invalid signature is NOT a legitimate
  //    delivery — reject and do not touch any order.
  if (!verifyWebhookSignature({ rawBody, signature })) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // 3. Parse only after the signature is trusted.
  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // We only act on captured payments. Acknowledge everything else so Razorpay
  // doesn't retry events we intentionally ignore.
  if (event.event !== "payment.captured") {
    return NextResponse.json({ received: true, ignored: event.event ?? null });
  }

  const entity = event.payload?.payment?.entity;
  const providerOrderId = entity?.order_id;
  const paymentId = entity?.id;
  if (!providerOrderId || !paymentId) {
    return NextResponse.json({ received: true, ignored: "missing-ids" });
  }

  const admin = createAdminClient();

  // 4. Idempotent transition — identical to /confirm. Dedupe is implicit: only a
  //    still-`created` order flips, so a retry or a confirm that already won
  //    updates 0 rows.
  const { data: updated, error: updateError } = await admin
    .from("orders")
    .update({ status: "paid", razorpay_payment_id: paymentId })
    .eq("razorpay_order_id", providerOrderId)
    .eq("status", "created")
    .select("order_number");

  if (updateError) {
    // A transient DB error: 500 so Razorpay retries the delivery.
    return NextResponse.json(
      { error: "Could not process webhook." },
      { status: 500 },
    );
  }

  if (updated && updated.length > 0) {
    // This delivery performed the transition (the winner) — including the
    // closed-tab case where /confirm never ran.
    //
    // TODO(feature 6/10): fire the WhatsApp + email order confirmation here.
    // /confirm carries an identical hook; only the path that actually
    // transitions the order fires, so the message is sent exactly once
    // regardless of which of {webhook, confirm} wins. Nothing is sent yet.
    //
    // TODO(production hardening): also verify `entity.amount` matches the
    // order's `total_paise` before marking paid, to reject underpayment.
    return NextResponse.json({
      received: true,
      orderNumber: updated[0].order_number,
      status: "paid",
    });
  }

  // 5. Zero rows updated — already paid (idempotent no-op; /confirm or an earlier
  //    delivery won) or an order we don't recognise. Acknowledge in both cases.
  const { data: existing } = await admin
    .from("orders")
    .select("order_number, status")
    .eq("razorpay_order_id", providerOrderId)
    .maybeSingle();

  return NextResponse.json({
    received: true,
    orderNumber: existing?.order_number ?? null,
    status: existing?.status ?? "unknown",
  });
}
