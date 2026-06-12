import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createPaymentOrder, getPaymentProvider } from "@/lib/payments";
import { serverEnv } from "@/lib/env.server";
import type { Json, TablesInsert } from "@/lib/supabase";
import { checkoutRequestSchema } from "@/lib/checkout/validation";
import { priceCart } from "@/lib/checkout/pricing";
import { validateAndApply } from "@/lib/discounts";
import { captureCart } from "@/lib/carts/capture";

// Uses node:crypto (via the payment layer) and the service-role client — must run
// on the Node.js runtime, never the edge.
export const runtime = "nodejs";

/**
 * POST /api/checkout/create-order
 *
 * The entry point of checkout. Validates the request at the trust boundary,
 * RE-PRICES the cart from the DB (never trusts client money — guardrail), mints
 * an `AV-YYYY-NNNNNN` order number, creates a provider (mock/Razorpay) order for
 * the server-computed total, upserts the guest customer, and inserts an `orders`
 * row in status `created`. Returns the refs the client needs to pay.
 *
 * All writes use the service-role client (server-only; bypasses RLS) — there is
 * no public write path to `orders`/`customers`.
 */
export async function POST(request: Request) {
  // 1. Parse + validate. Unknown keys (e.g. a smuggled price) are stripped here.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check your details and try again.",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 },
    );
  }
  const { items, customer, address, discountCode } = parsed.data;

  // 2. Re-price from the DB. The forged-price path dies here: only refs are read.
  const priced = await priceCart(items);
  if (!priced.ok) {
    return NextResponse.json({ error: priced.error }, { status: 409 });
  }
  const { cart } = priced;
  if (cart.totalPaise <= 0) {
    return NextResponse.json(
      { error: "Your order total is invalid. Please review your cart." },
      { status: 400 },
    );
  }

  // 2b. Discount (feature 8). The code is recomputed from the DB server-side — a
  //     client-sent discount amount is never read (it isn't even in the schema).
  //     Policy: proceed-at-full-price. A rejected code does NOT block the order;
  //     we create it with no discount and hand the reason back as a warning the
  //     checkout UI can surface. Only a valid code reduces the server total and is
  //     stored on the order. NOTHING is redeemed here — redemption happens only at
  //     the paid transition.
  let discountPaise = 0;
  let freeShipping = false;
  let appliedCode: string | null = null;
  let discountWarning: string | null = null;

  if (discountCode) {
    const result = await validateAndApply({
      code: discountCode,
      phone: customer.phone,
      subtotalPaise: cart.subtotalPaise,
    });
    if (result.ok) {
      discountPaise = result.discount_paise;
      freeShipping = result.free_shipping;
      appliedCode = result.code; // normalized; stored on the order
    } else {
      discountWarning = result.reason;
    }
  }

  // Final server-computed money. Shipping is zeroed by a free_shipping code; the
  // total is floored at 0 so it can never go negative (overflow guard).
  const shippingPaise = freeShipping ? 0 : cart.shippingPaise;
  const totalPaise = Math.max(
    0,
    cart.subtotalPaise - discountPaise + shippingPaise,
  );

  const admin = createAdminClient();

  // 3. Mint a unique order number (atomic per-year counter — see migration).
  const { data: orderNumber, error: numberError } = await admin.rpc(
    "next_order_number",
  );
  if (numberError || !orderNumber) {
    return NextResponse.json(
      { error: "Could not start your order. Please try again." },
      { status: 500 },
    );
  }

  // 4. Create the provider order for the SERVER total (mock in dev; Razorpay
  //    untouched when keys exist). Only the payment helpers are imported here.
  let providerOrderId: string;
  try {
    const result = await createPaymentOrder({
      amountPaise: totalPaise,
      orderNumber,
      notes: { order_number: orderNumber, phone: customer.phone },
    });
    providerOrderId = result.providerOrderId;
  } catch {
    return NextResponse.json(
      { error: "Could not reach the payment provider. Please try again." },
      { status: 502 },
    );
  }

  // 5. Upsert the guest customer (keyed by normalized phone).
  const { error: customerError } = await admin.from("customers").upsert(
    {
      phone: customer.phone,
      name: customer.name,
      ...(customer.email ? { email: customer.email } : {}),
    },
    { onConflict: "phone" },
  );
  if (customerError) {
    return NextResponse.json(
      { error: "Could not save your details. Please try again." },
      { status: 500 },
    );
  }

  // 6. Insert the order in status `created`, carrying the provider order id so
  //    the confirm call and the webhook can both reconcile against it.
  const orderRow: TablesInsert<"orders"> = {
    order_number: orderNumber,
    customer_phone: customer.phone,
    name: customer.name,
    email: customer.email ?? null,
    items: cart.items as unknown as Json,
    subtotal_paise: cart.subtotalPaise,
    // Only a code that VALIDATED is stored (null on no-code or a rejected code),
    // alongside the server-computed discount it produced. Redemption is written
    // later, only on paid.
    discount_code: appliedCode,
    discount_paise: discountPaise,
    shipping_paise: shippingPaise, // 0 (free, approved) unless a code changes it
    total_paise: totalPaise,
    status: "created",
    razorpay_order_id: providerOrderId,
    shipping_address: address as unknown as Json,
  };

  const { error: insertError } = await admin.from("orders").insert(orderRow);
  if (insertError) {
    return NextResponse.json(
      { error: "Could not create your order. Please try again." },
      { status: 500 },
    );
  }

  // Capture the cart at checkout START (feature 18) — one `active` carts row per
  // phone, with the SERVER-priced items, so the recovery cron can nudge it if no
  // payment lands. Best-effort and non-fatal: it never blocks or fails the order.
  await captureCart({
    phone: customer.phone,
    email: customer.email ?? null,
    items: cart.items,
  });

  // Tell the client how to pay: provider name decides mock vs. real modal;
  // keyId is null in mock mode (the client uses the simulate-success path).
  const env = serverEnv();
  return NextResponse.json(
    {
      orderNumber,
      providerOrderId,
      amountPaise: totalPaise,
      providerName: getPaymentProvider().name,
      // Empty string (unset env) normalizes to null; providerName is the signal
      // the client actually uses to choose the mock vs. real pay path.
      keyId: env.RAZORPAY_KEY_ID || null,
      // Discount outcome for the checkout UI: the applied discount (so it can show
      // the reduced total) or, on proceed-at-full-price, the rejection reason.
      discount: discountCode
        ? appliedCode
          ? {
              applied: true as const,
              code: appliedCode,
              discountPaise,
              freeShipping,
            }
          : { applied: false as const, reason: discountWarning }
        : null,
    },
    { status: 201 },
  );
}
